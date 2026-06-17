"""Home routes: fetch full home payload + handle quick-adjust chips."""
import asyncio

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app import database as db
from app.deps import get_current_user
from app.services import carbon_calculator as calc
from app.services.gemini_client import generate_hero_insight, generate_hidden_impact

router = APIRouter(prefix="/home", tags=["home"])


@router.get("", summary="Full home payload: score, story, insights, twin stage")
async def get_home(current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    profile = await db.get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Complete onboarding first.")

    # Generate hero insight concurrently (cached in profile if available)
    cached_insight = profile.get("hero_insight")
    cached_hidden = profile.get("hidden_impact")

    if not cached_insight or not cached_hidden:
        hero_task = generate_hero_insight(profile)
        hidden_task = generate_hidden_impact(profile)
        hero_result, hidden_result = await asyncio.gather(hero_task, hidden_task, return_exceptions=True)

        if isinstance(hero_result, Exception):
            hero_result = {
                "greeting": f"Welcome back, {profile.get('display_name', 'there')} 🌿",
                "insight": f"Your GreenScore is {profile.get('green_score', 0)} — let's push it higher.",
            }
        if isinstance(hidden_result, Exception):
            hidden_result = {
                "title": "Standby power drain",
                "insight": "Devices on standby use more energy than you think.",
                "action": "Use smart power strips",
                "savings_kg": 45,
            }

        # Cache for next load
        await db.upsert_profile(
            user_id,
            {"hero_insight": hero_result, "hidden_impact": hidden_result},
        )
    else:
        hero_result = cached_insight
        hidden_result = cached_hidden

    # Compute EarthTwin stage from score
    score = profile.get("green_score", 0)
    twin_stage = _score_to_stage(score)

    return {
        "display_name": profile.get("display_name", ""),
        "green_score": profile.get("green_score", 0),
        "grade": profile.get("grade", "F"),
        "total_annual_kg": profile.get("total_annual_kg", 0),
        "category_breakdown": profile.get("category_breakdown", {}),
        "category_scores": profile.get("category_scores", {}),
        "carbon_story": profile.get("carbon_story", ""),
        "weekly_actions": profile.get("weekly_actions", []),
        "streak_days": profile.get("streak_days", 0),
        "hero_insight": hero_result,
        "hidden_impact": hidden_result,
        "earth_twin": {
            "stage": twin_stage["stage"],
            "label": twin_stage["label"],
            "description": twin_stage["description"],
        },
    }


class AdjustRequest(BaseModel):
    field: str   # e.g. "diet", "transport_mode", "commute_days"
    value: str | float | int


@router.post("/adjust", summary="Quick-adjust a lifestyle chip and recalculate score")
async def adjust(req: AdjustRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    profile = await db.get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Complete onboarding first.")

    # Patch onboarding answers and recalc
    answers = profile.get("onboarding_answers", {})
    answers[req.field] = req.value
    result = calc.calculate_from_onboarding(answers)

    # Invalidate cached AI insights so they regenerate on next /home load
    await db.upsert_profile(
        user_id,
        {
            "onboarding_answers": answers,
            "green_score": result["green_score"],
            "grade": result["grade"],
            "category_breakdown": result["category_breakdown"],
            "category_scores": result["category_scores"],
            "total_annual_kg": result["total_annual_kg"],
            "hero_insight": None,
            "hidden_impact": None,
        },
    )

    return {
        "green_score": result["green_score"],
        "grade": result["grade"],
        "total_annual_kg": result["total_annual_kg"],
        "category_breakdown": result["category_breakdown"],
        "earth_twin_stage": _score_to_stage(result["green_score"])["stage"],
    }


def _score_to_stage(score: int) -> dict:
    stages = [
        (85, 5, "Forest", "Your choices are nurturing an entire ecosystem 🌳"),
        (70, 4, "Tree", "Growing strong — your impact is deeply rooted 🌲"),
        (55, 3, "Sapling", "Branching out with meaningful green choices 🌿"),
        (40, 2, "Sprout", "Early days — every small action matters 🌱"),
        (0, 1, "Seed", "Your sustainability journey starts here 🌰"),
    ]
    for threshold, stage, label, desc in stages:
        if score >= threshold:
            return {"stage": stage, "label": label, "description": desc}
    return {"stage": 1, "label": "Seed", "description": "Your sustainability journey starts here 🌰"}
