const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getProfile: () => request('/api/v1/users/me'),
  saveCarbonDna: (data: object) =>
    request('/api/v1/users/carbon-dna', { method: 'POST', body: JSON.stringify(data) }),
  logCarbon: (data: object) =>
    request('/api/v1/carbon/log', { method: 'POST', body: JSON.stringify(data) }),
  getScore: () => request('/api/v1/carbon/score'),
  askCoach: (message: string) =>
    request('/api/v1/ai/coach', { method: 'POST', body: JSON.stringify({ message }) }),
  getImpactLens: () => request('/api/v1/ai/impact-lens'),
  getWeeklyGoals: () => request('/api/v1/ai/weekly-goals'),
};
