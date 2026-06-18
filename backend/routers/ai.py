"""
AI coaching API router for Verdant AI.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, select

from database import get_session
from models import CarbonLog
from services.ai_service import (
    get_ecocoach_response,
    generate_impact_lens_report,
    generate_weekly_goals,
)
from services.user_service import get_or_create_default_user

router = APIRouter(prefix="/api/v1/ai", tags=["AI"])


class CoachRequest(BaseModel):
    """Request schema for EcoCoach chat."""
    message: str


class CoachResponse(BaseModel):
    """Response schema for EcoCoach chat."""
    reply: str


class ImpactLensResponse(BaseModel):
    """Response schema for the ImpactLens AI report."""
    report: str


class WeeklyGoalsResponse(BaseModel):
    """Response schema for weekly sustainability goals."""
    goals: str


@router.post("/coach", response_model=CoachResponse)
async def ecocoach(
    payload: CoachRequest,
    session: Session = Depends(get_session),
) -> CoachResponse:
    """
    Send a message to the EcoCoach AI assistant.

    Args:
        payload: User message.
        session: Database session dependency.

    Returns:
        CoachResponse with AI reply.
    """
    user = get_or_create_default_user(session)
    reply = await get_ecocoach_response(
        message=payload.message,
        carbon_dna=user.carbon_dna,
    )
    return CoachResponse(reply=reply)


@router.get("/impact-lens", response_model=ImpactLensResponse)
async def impact_lens(session: Session = Depends(get_session)) -> ImpactLensResponse:
    """
    Generate the user's ImpactLens AI report.

    Args:
        session: Database session dependency.

    Returns:
        ImpactLensResponse with a full narrative report.
    """
    user = get_or_create_default_user(session)
    logs = session.exec(select(CarbonLog).where(CarbonLog.user_id == user.id)).all()

    monthly_emissions: dict[str, float] = {}
    for log in logs:
        monthly_emissions[log.category] = (
            monthly_emissions.get(log.category, 0.0) + log.emissions_kg
        )

    report = await generate_impact_lens_report(
        user_name="You",
        monthly_emissions=monthly_emissions,
        carbon_dna=user.carbon_dna,
    )
    return ImpactLensResponse(report=report)


@router.get("/weekly-goals", response_model=WeeklyGoalsResponse)
async def weekly_goals(session: Session = Depends(get_session)) -> WeeklyGoalsResponse:
    """
    Generate personalized weekly sustainability goals.

    Args:
        session: Database session dependency.

    Returns:
        WeeklyGoalsResponse with 3 actionable goals.
    """
    user = get_or_create_default_user(session)
    goals = await generate_weekly_goals(carbon_dna=user.carbon_dna)
    return WeeklyGoalsResponse(goals=goals)
