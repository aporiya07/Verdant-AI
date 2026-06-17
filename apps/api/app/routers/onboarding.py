"""Onboarding routes: submit answers → calculate footprint → trigger Gemini."""
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app import database as db
from app.deps import get_current_user
from app.services import carbon_calculator as calc
from app.services.gemini_client import generate_carbon_story, generate_weekly_actions

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


class OnboardingAnswers(BaseModel):
    # Step 1: Transport
    transport_mode: str = "car_petrol"
    commute_km: float = 15.0
    commute_days: int = 5
    annual_flights_short: int = 0
    annual_flights_long: int = 0
    # Step 2: Energy
    monthly_kwh: float = 300.0
    renewable_pct: int = 0
    region: str = "default"
    # Step 3: Food
    diet: str = "omnivore"
    meals_out_per_week: int = 3
    # Step 4: Shopping
    monthly_spend_usd: float = 200.0
    # Step 5: Waste
    recycling_habit: str = "some"
    waste_kg_per_week: float = 2.0
    # Profile
    display_name: str = ""


@router.post("/submit", summary="Submit onboarding answers, calculate footprint, generate AI story")
async def submit_onboarding(
    answers: OnboardingAnswers,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["sub"]
    answers_dict = answers.model_dump()

    # Calculate footprint
    result = calc.calculate_from_onboarding(answers_dict)

    # Set display name
    display_name = answers.display_name or current_user.get("email", "").split("@")[0].capitalize() or "Eco Explorer"

    # Build profile payload for Gemini context
    profile = {
        "display_name": display_name,
        "green_score": result["green_score"],
        "grade": result["grade"],
        "category_breakdown": result["category_breakdown"],
        "onboarding_answers": answers_dict,
    }

    # Generate AI content (run concurrently)
    import asyncio
    carbon_story, weekly_actions = await asyncio.gather(
        generate_carbon_story(profile),
        generate_weekly_actions(profile),
        return_exceptions=True,
    )

    if isinstance(carbon_story, Exception):
        carbon_story = f"Your annual footprint is {result['total_annual_kg']} kg CO₂e. Small changes in {max(result['category_breakdown'], key=result['category_breakdown'].get)} can make a big difference."

    if isinstance(weekly_actions, Exception):
        weekly_actions = []

    # Persist profile
    await db.upsert_profile(
        user_id,
        {
            "display_name": display_name,
            "onboarding_answers": answers_dict,
            "green_score": result["green_score"],
            "grade": result["grade"],
            "category_breakdown": result["category_breakdown"],
            "category_scores": result["category_scores"],
            "total_annual_kg": result["total_annual_kg"],
            "carbon_story": carbon_story,
            "weekly_actions": weekly_actions,
            "streak_days": 1,
        },
    )

    return {
        "success": True,
        "green_score": result["green_score"],
        "grade": result["grade"],
        "total_annual_kg": result["total_annual_kg"],
        "category_breakdown": result["category_breakdown"],
        "carbon_story": carbon_story,
        "weekly_actions": weekly_actions,
        "display_name": display_name,
    }
