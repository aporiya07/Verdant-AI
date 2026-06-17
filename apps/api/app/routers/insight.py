"""Hidden impact insight card route."""
from fastapi import APIRouter, Depends, HTTPException

from app import database as db
from app.deps import get_current_user
from app.services.gemini_client import generate_hidden_impact

router = APIRouter(prefix="/insight", tags=["insight"])


@router.get("/hidden", summary="Cached hidden impact card from Gemini")
async def hidden_insight(current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    profile = await db.get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Complete onboarding first.")

    # Return cached or regenerate
    cached = profile.get("hidden_impact")
    if cached:
        return cached

    result = await generate_hidden_impact(profile)
    await db.upsert_profile(user_id, {"hidden_impact": result})
    return result
