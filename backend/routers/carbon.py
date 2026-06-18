"""
Carbon logging and scoring API router for Verdant AI.
"""

from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from database import get_session
from models import CarbonLog, User
from services.carbon_service import dispatch_emission_calculator, get_sustainability_grade
from services.user_service import get_or_create_default_user, award_xp

router = APIRouter(prefix="/api/v1/carbon", tags=["Carbon"])


class CarbonLogRequest(BaseModel):
    """Request schema for logging a carbon activity."""
    category: str
    details: Dict[str, Any]


class CarbonLogResponse(BaseModel):
    """Response schema for a carbon log entry."""
    id: str
    category: str
    emissions_kg: float
    message: str


class GreenScoreResponse(BaseModel):
    """Response schema for the user's GreenScore dashboard."""
    total_monthly_kg: float
    daily_kg_avg: float
    sustainability_grade: str
    sustainability_score: int
    total_xp: int
    current_level: int
    breakdown: Dict[str, float]


@router.post("/log", response_model=CarbonLogResponse)
def log_carbon_activity(
    payload: CarbonLogRequest,
    session: Session = Depends(get_session),
) -> CarbonLogResponse:
    """
    Log a carbon-emitting activity and award XP.

    Args:
        payload: Carbon activity request data.
        session: Database session dependency.

    Returns:
        CarbonLogResponse with emission details.
    """
    try:
        emissions_kg = dispatch_emission_calculator(payload.category, payload.details)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    user = get_or_create_default_user(session)
    log = CarbonLog(
        user_id=user.id,
        category=payload.category,
        emissions_kg=emissions_kg,
        details=payload.details,
    )
    session.add(log)
    session.commit()
    session.refresh(log)
    award_xp(user, session, xp_amount=10)

    return CarbonLogResponse(
        id=log.id,
        category=log.category,
        emissions_kg=log.emissions_kg,
        message=f"Logged {emissions_kg:.2f} kg CO2e for {payload.category}. +10 XP 🌱",
    )


@router.get("/score", response_model=GreenScoreResponse)
def get_green_score(session: Session = Depends(get_session)) -> GreenScoreResponse:
    """
    Get the user's current GreenScore and monthly breakdown.

    Args:
        session: Database session dependency.

    Returns:
        GreenScoreResponse with full scoring details.
    """
    user = get_or_create_default_user(session)
    logs = session.exec(select(CarbonLog).where(CarbonLog.user_id == user.id)).all()

    breakdown: Dict[str, float] = {}
    for log in logs:
        breakdown[log.category] = breakdown.get(log.category, 0.0) + log.emissions_kg

    total_monthly_kg = sum(breakdown.values())
    daily_avg = round(total_monthly_kg / 30, 2)

    # Sustainability score: inverse of footprint (max 100)
    score = max(0, int(100 - (daily_avg / 20 * 100)))
    user.sustainability_score = score
    session.add(user)
    session.commit()

    return GreenScoreResponse(
        total_monthly_kg=round(total_monthly_kg, 2),
        daily_kg_avg=daily_avg,
        sustainability_grade=get_sustainability_grade(daily_avg),
        sustainability_score=score,
        total_xp=user.total_xp,
        current_level=user.current_level,
        breakdown=breakdown,
    )
