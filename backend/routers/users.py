"""
User profile API router for Verdant AI.
"""

from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, select

from database import get_session
from models import Achievement, User
from services.user_service import get_or_create_default_user
from services.carbon_service import get_level_name

router = APIRouter(prefix="/api/v1/users", tags=["Users"])


class CarbonDnaRequest(BaseModel):
    """Request schema for Carbon DNA onboarding."""
    transport: str
    food: str
    energy: str
    shopping: str
    waste: str
    lifestyle_classification: Optional[str] = None


class UserProfileResponse(BaseModel):
    """Response schema for the user profile."""
    id: str
    email: str
    lifestyle_classification: Optional[str]
    sustainability_score: int
    total_xp: int
    current_level: int
    level_name: str
    carbon_dna: Optional[Dict[str, Any]]
    achievements: list[str]


@router.get("/me", response_model=UserProfileResponse)
def get_profile(session: Session = Depends(get_session)) -> UserProfileResponse:
    """
    Get the current user's full profile.

    Args:
        session: Database session dependency.

    Returns:
        UserProfileResponse with profile and achievements.
    """
    user = get_or_create_default_user(session)
    achievements = session.exec(
        select(Achievement).where(Achievement.user_id == user.id)
    ).all()
    return UserProfileResponse(
        id=user.id,
        email=user.email,
        lifestyle_classification=user.lifestyle_classification,
        sustainability_score=user.sustainability_score,
        total_xp=user.total_xp,
        current_level=user.current_level,
        level_name=get_level_name(user.total_xp),
        carbon_dna=user.carbon_dna,
        achievements=[a.badge_name for a in achievements],
    )


@router.post("/carbon-dna", response_model=UserProfileResponse)
def save_carbon_dna(
    payload: CarbonDnaRequest,
    session: Session = Depends(get_session),
) -> UserProfileResponse:
    """
    Save the user's Carbon DNA from the onboarding questionnaire.

    Args:
        payload: Carbon DNA data from onboarding.
        session: Database session dependency.

    Returns:
        Updated UserProfileResponse.
    """
    user = get_or_create_default_user(session)
    user.carbon_dna = payload.model_dump(exclude={"lifestyle_classification"})
    if payload.lifestyle_classification:
        user.lifestyle_classification = payload.lifestyle_classification
    else:
        # Auto-classify based on transport
        transport = payload.transport
        if transport in ("bike", "walking", "train"):
            user.lifestyle_classification = "Green Commuter"
        elif transport in ("car_electric",):
            user.lifestyle_classification = "EV Adopter"
        elif transport in ("flight_short", "flight_long"):
            user.lifestyle_classification = "Frequent Flyer"
        else:
            user.lifestyle_classification = "Urban Commuter"

    # Award XP for completing onboarding
    user.total_xp += 50
    session.add(user)
    session.commit()
    session.refresh(user)

    achievements = session.exec(
        select(Achievement).where(Achievement.user_id == user.id)
    ).all()
    return UserProfileResponse(
        id=user.id,
        email=user.email,
        lifestyle_classification=user.lifestyle_classification,
        sustainability_score=user.sustainability_score,
        total_xp=user.total_xp,
        current_level=user.current_level,
        level_name=get_level_name(user.total_xp),
        carbon_dna=user.carbon_dna,
        achievements=[a.badge_name for a in achievements],
    )
