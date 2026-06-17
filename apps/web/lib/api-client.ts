/**
 * Verdant AI — API client
 * Thin wrapper around fetch with Bearer auth, base URL config, and streaming support.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// Token stored in memory (not localStorage) for security
let _token: string | null = null;

export function setToken(token: string | null) {
  _token = token;
  if (token) {
    sessionStorage.setItem("verdant_token", token);
  } else {
    sessionStorage.removeItem("verdant_token");
  }
}

export function getToken(): string | null {
  if (_token) return _token;
  if (typeof window !== "undefined") {
    _token = sessionStorage.getItem("verdant_token");
  }
  return _token;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json();
}

// Auth
export const api = {
  auth: {
    demo: () => request<{ access_token: string; user_id: string; is_demo: boolean }>("/auth/demo", { method: "POST" }),
    register: (email: string, password: string, display_name: string) =>
      request<{ access_token: string; user_id: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, display_name }),
      }),
    login: (email: string, password: string) =>
      request<{ access_token: string; user_id: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    me: () => request<{ id: string; email: string; display_name: string; has_onboarded: boolean; is_demo: boolean }>("/auth/me"),
  },
  onboarding: {
    submit: (answers: Record<string, unknown> | { [k: string]: unknown }) =>
      request<{
        green_score: number;
        grade: string;
        total_annual_kg: number;
        category_breakdown: Record<string, number>;
        carbon_story: string;
        weekly_actions: { label: string; category: string; impact: string }[];
        display_name: string;
      }>("/onboarding/submit", { method: "POST", body: JSON.stringify(answers) }),
  },
  home: {
    get: () =>
      request<{
        display_name: string;
        green_score: number;
        grade: string;
        total_annual_kg: number;
        category_breakdown: Record<string, number>;
        category_scores: Record<string, number>;
        carbon_story: string;
        weekly_actions: { label: string; category: string; impact: string }[];
        streak_days: number;
        hero_insight: { greeting: string; insight: string };
        hidden_impact: { title: string; insight: string; action: string; savings_kg: number };
        earth_twin: { stage: number; label: string; description: string };
      }>("/home"),
    adjust: (field: string, value: string | number) =>
      request<{ green_score: number; grade: string; total_annual_kg: number; category_breakdown: Record<string, number>; earth_twin_stage: number }>("/home/adjust", {
        method: "POST",
        body: JSON.stringify({ field, value }),
      }),
  },
  futurecast: {
    whisper: (field: string, value: string | number, label: string) =>
      request<{
        current_kg: number;
        projected_kg: number;
        savings_kg: number;
        savings_pct: number;
        projected_score: number;
        projected_grade: string;
        category_breakdown: Record<string, number>;
        whisper: string;
      }>("/futurecast/whisper", { method: "POST", body: JSON.stringify({ field, value, label }) }),
    presets: () =>
      request<{ presets: { id: string; title: string; icon: string; field: string; value: string | number; label: string }[] }>("/futurecast/presets"),
  },
  insight: {
    hidden: () =>
      request<{ title: string; insight: string; action: string; savings_kg: number }>("/insight/hidden"),
  },
};

// Streaming EcoCoach
export async function* streamCoach(message: string): AsyncGenerator<string> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/coach/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok || !res.body) {
    yield "I'm having trouble connecting. Try again in a moment.";
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split("\n")) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") return;
        try {
          const { text } = JSON.parse(data);
          if (text) yield text;
        } catch {}
      }
    }
  }
}
