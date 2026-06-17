"""FutureCast: live scenario simulation with Gemini whisper narrative."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app import database as db
from app.deps import get_current_user
from app.services import carbon_calculator as calc
from app.services.gemini_client import generate_futurecast_whisper

router = APIRouter(prefix="/futurecast", tags=["futurecast"])


class WhisperRequest(BaseModel):
    field: str
    value: str | float | int
    label: str  # Human-readable label for Gemini prompt, e.g. "biking 3 days/week"


@router.post("/whisper", summary="Simulate adjustment and get Gemini whisper narrative")
async def whisper(req: WhisperRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    profile = await db.get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Complete onboarding first.")

    current_kg = profile.get("total_annual_kg", 4800)

    # Apply adjustment to a copy of onboarding answers
    answers = dict(profile.get("onboarding_answers", {}))
    answers[req.field] = req.value
    result = calc.calculate_from_onboarding(answers)
    projected_kg = result["total_annual_kg"]

    # Generate Gemini whisper
    try:
        whisper_text = await generate_futurecast_whisper(
            adjustment_label=req.label,
            current_kg=current_kg,
            projected_kg=projected_kg,
            profile=profile,
        )
    except Exception:
        savings = round(current_kg - projected_kg)
        pct = round((savings / max(current_kg, 1)) * 100)
        whisper_text = f"That change could save you ~{savings} kg CO₂e per year ({pct}% reduction)."

    return {
        "current_kg": current_kg,
        "projected_kg": projected_kg,
        "savings_kg": round(current_kg - projected_kg, 1),
        "savings_pct": round((current_kg - projected_kg) / max(current_kg, 1) * 100, 1),
        "projected_score": result["green_score"],
        "projected_grade": result["grade"],
        "category_breakdown": result["category_breakdown"],
        "whisper": whisper_text,
    }


@router.get("/presets", summary="3 preset adjustment scenarios")
async def presets():
    return {
        "presets": [
            {
                "id": "bike_commute",
                "title": "Bike to Work",
                "icon": "🚴",
                "field": "transport_mode",
                "value": "cycling",
                "label": "cycling to work instead of driving",
            },
            {
                "id": "plant_based",
                "title": "Go Plant-Based",
                "icon": "🥦",
                "field": "diet",
                "value": "vegan",
                "label": "switching to a vegan diet",
            },
            {
                "id": "green_energy",
                "title": "Switch to Green Energy",
                "icon": "☀️",
                "field": "renewable_pct",
                "value": 100,
                "label": "switching to 100% renewable electricity",
            },
        ]
    }
