"""
Gemini AI client with primary (3.5 Flash) / fallback (3.1 Flash-Lite) routing.

5 touchpoints:
  1. carbon_story     — post-onboarding narrative
  2. hero_insight     — home page greeting + top insight
  3. eco_coach        — streaming conversational coaching
  4. hidden_impact    — structured JSON insight card
  5. futurecast_whisper — slider one-liner narrative
"""
import asyncio
import json
import logging
from typing import AsyncIterator

from google import genai
from google.genai import types as genai_types

from app.config import settings

logger = logging.getLogger(__name__)

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


def _build_context(profile: dict) -> str:
    """Build user context string for prompt injection."""
    name = profile.get("display_name", "there")
    score = profile.get("green_score", 50)
    grade = profile.get("grade", "C")
    breakdown = profile.get("category_breakdown", {})
    answers = profile.get("onboarding_answers", {})

    top_category = max(breakdown, key=lambda k: breakdown[k]) if breakdown else "transport"
    top_kg = breakdown.get(top_category, 0)
    total_kg = sum(breakdown.values()) if breakdown else 0

    lines = [
        f"User: {name}",
        f"GreenScore: {score}/100 (Grade {grade})",
        f"Annual CO2e: {round(total_kg, 0)} kg",
        f"Top emission source: {top_category} ({round(top_kg, 0)} kg/yr)",
        f"Category breakdown: " + ", ".join(f"{k}={round(v, 0)}kg" for k, v in breakdown.items()),
        f"Diet: {answers.get('diet', 'unknown')}",
        f"Transport mode: {answers.get('transport_mode', 'unknown')}",
        f"Commute: {answers.get('commute_km', '?')}km × {answers.get('commute_days', '?')} days/wk",
        f"Monthly energy: {answers.get('monthly_kwh', '?')} kWh",
        f"Recycling: {answers.get('recycling_habit', 'unknown')}",
    ]
    return "\n".join(lines)


async def _generate(
    prompt: str,
    model: str,
    system: str = "",
    json_mode: bool = False,
    thinking_level: str = "minimal",
) -> str:
    """Single non-streaming generation with timeout."""
    client = _get_client()
    config_kwargs: dict = {"thinking_config": genai_types.ThinkingConfig(thinking_budget=0 if thinking_level == "minimal" else 1024)}
    if json_mode:
        config_kwargs["response_mime_type"] = "application/json"
    if system:
        config_kwargs["system_instruction"] = system

    try:
        response = await asyncio.wait_for(
            asyncio.to_thread(
                client.models.generate_content,
                model=model,
                contents=prompt,
                config=genai_types.GenerateContentConfig(**config_kwargs),
            ),
            timeout=settings.gemini_timeout_secs,
        )
        return response.text or ""
    except Exception as e:
        logger.warning("Gemini %s failed: %s", model, e)
        raise


async def _generate_with_fallback(
    prompt: str,
    system: str = "",
    json_mode: bool = False,
    thinking_level: str = "minimal",
) -> str:
    """Try primary model, fall back to lite on error/timeout."""
    try:
        return await _generate(
            prompt, settings.gemini_model_primary, system, json_mode, thinking_level
        )
    except Exception:
        logger.info("Falling back to %s", settings.gemini_model_fallback)
        return await _generate(
            prompt, settings.gemini_model_fallback, system, json_mode, thinking_level
        )


# ---------------------------------------------------------------------------
# Touchpoint 1: Carbon Story
# ---------------------------------------------------------------------------

async def generate_carbon_story(profile: dict) -> str:
    """2-sentence personalized narrative generated after onboarding."""
    ctx = _build_context(profile)
    name = profile.get("display_name", "you")
    prompt = (
        f"Given this sustainability profile:\n{ctx}\n\n"
        f"Write exactly 2 short, warm, encouraging sentences for {name}. "
        "First sentence: their biggest emission source and why it matters. "
        "Second sentence: the single most impactful change they could make. "
        "Use 'you' voice. Be specific with numbers. No markdown."
    )
    return await _generate_with_fallback(prompt, thinking_level="minimal")


# ---------------------------------------------------------------------------
# Touchpoint 2: Hero Insight
# ---------------------------------------------------------------------------

async def generate_hero_insight(profile: dict) -> dict:
    """Short greeting + #1 insight for the home page hero."""
    ctx = _build_context(profile)
    name = profile.get("display_name", "there")
    breakdown = profile.get("category_breakdown", {})
    top = max(breakdown, key=lambda k: breakdown[k]) if breakdown else "transport"
    top_pct = round(breakdown.get(top, 0) / max(sum(breakdown.values()), 1) * 100)

    prompt = (
        f"Profile:\n{ctx}\n\n"
        "Return JSON only: {\"greeting\": \"...\", \"insight\": \"...\"}\n"
        f"greeting: 1 personalised line starting with time-of-day greeting for {name}.\n"
        f"insight: 1 punchy line about {top} being {top_pct}% of their footprint. "
        "Include the percentage. Max 12 words each. No markdown."
    )
    raw = await _generate(
        prompt, settings.gemini_model_fallback, json_mode=True, thinking_level="minimal"
    )
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "greeting": f"Hello, {name} 👋",
            "insight": f"{top.capitalize()} is your biggest opportunity — {top_pct}% of your footprint.",
        }


# ---------------------------------------------------------------------------
# Touchpoint 3: EcoCoach streaming
# ---------------------------------------------------------------------------

async def stream_eco_coach(message: str, profile: dict, history: list[dict]) -> AsyncIterator[str]:
    """Stream EcoCoach response with full profile context."""
    ctx = _build_context(profile)
    system = (
        "You are EcoCoach, a warm, knowledgeable sustainability assistant inside Verdant AI. "
        "You have deep context about this user's carbon footprint. "
        "Give specific, actionable, encouraging advice. "
        "Keep responses concise (2-4 sentences max). No markdown, no bullet points. "
        f"\n\nUser context:\n{ctx}"
    )

    # Build conversation history for context
    contents = []
    for msg in history[-6:]:  # Last 3 exchanges
        contents.append(msg["content"])
    contents.append(message)

    client = _get_client()

    async def _stream() -> AsyncIterator[str]:
        try:
            for chunk in client.models.generate_content_stream(
                model=settings.gemini_model_primary,
                contents="\n".join(contents),
                config=genai_types.GenerateContentConfig(
                    system_instruction=system,
                    thinking_config=genai_types.ThinkingConfig(thinking_budget=512),
                ),
            ):
                if chunk.text:
                    yield chunk.text
        except Exception:
            # Fallback: non-streaming
            result = await _generate_with_fallback(
                message, system=system, thinking_level="minimal"
            )
            yield result

    return _stream()


# ---------------------------------------------------------------------------
# Touchpoint 4: Hidden Impact Card
# ---------------------------------------------------------------------------

async def generate_hidden_impact(profile: dict) -> dict:
    """Structured JSON insight card — often a non-obvious emission source."""
    ctx = _build_context(profile)
    prompt = (
        f"Profile:\n{ctx}\n\n"
        "Return JSON only:\n"
        '{"title": "...", "insight": "...", "action": "...", "savings_kg": 0}\n'
        "title: catchy title for a non-obvious emission source (max 6 words)\n"
        "insight: 1 specific insight about a hidden or underestimated emission (max 20 words)\n"
        "action: concrete single action to reduce it (max 12 words)\n"
        "savings_kg: estimated annual kg CO2e savings as integer\n"
        "Focus on something unexpected — not just 'drive less'."
    )
    raw = await _generate_with_fallback(prompt, json_mode=True, thinking_level="minimal")
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "title": "Your standby devices matter",
            "insight": "Electronics on standby account for 5-10% of home energy use.",
            "action": "Use smart power strips to cut standby drain",
            "savings_kg": 45,
        }


# ---------------------------------------------------------------------------
# Touchpoint 5: FutureCast Whisper
# ---------------------------------------------------------------------------

async def generate_futurecast_whisper(
    adjustment_label: str,
    current_kg: float,
    projected_kg: float,
    profile: dict,
) -> str:
    """One-line narrative for a FutureCast scenario."""
    savings = round(current_kg - projected_kg)
    pct = round((savings / max(current_kg, 1)) * 100)
    name = profile.get("display_name", "you")
    prompt = (
        f"If {name} makes this change: '{adjustment_label}'\n"
        f"They would save approximately {savings} kg CO₂e/year ({pct}% reduction).\n"
        "Write exactly 1 punchy, motivating sentence about this impact. "
        "Include the savings number. Max 15 words. No markdown."
    )
    return await _generate(
        prompt, settings.gemini_model_fallback, thinking_level="minimal"
    )


# ---------------------------------------------------------------------------
# Weekly Actions
# ---------------------------------------------------------------------------

async def generate_weekly_actions(profile: dict) -> list[dict]:
    """3 personalised weekly actions based on footprint profile."""
    ctx = _build_context(profile)
    prompt = (
        f"Profile:\n{ctx}\n\n"
        'Return JSON array of exactly 3 objects: [{"label": "...", "category": "...", "impact": "..."}]\n'
        "label: short action title (max 5 words)\n"
        "category: one of transport|energy|food|shopping|waste\n"
        "impact: '~X kg CO2e/yr saved' string\n"
        "Make actions specific to this user's biggest emission sources."
    )
    raw = await _generate_with_fallback(prompt, json_mode=True, thinking_level="minimal")
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return [
            {"label": "Try one meat-free day", "category": "food", "impact": "~50 kg CO2e/yr saved"},
            {"label": "Shorten your commute", "category": "transport", "impact": "~120 kg CO2e/yr saved"},
            {"label": "Turn down heating 1°C", "category": "energy", "impact": "~80 kg CO2e/yr saved"},
        ]
