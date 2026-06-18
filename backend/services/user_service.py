"""
User management service for Verdant AI.
"""

from sqlmodel import Session, select
from models import User, Achievement
from services.carbon_service import get_level_name, get_sustainability_grade


ACHIEVEMENT_RULES: list[dict] = [
    {"badge": "Green Starter", "condition": lambda u: u.total_xp >= 50},
    {"badge": "Energy Saver", "condition": lambda u: u.total_xp >= 200},
    {"badge": "Transit Champion", "condition": lambda u: u.total_xp >= 500},
    {"badge": "Sustainable Shopper", "condition": lambda u: u.total_xp >= 1000},
    {"badge": "Climate Hero", "condition": lambda u: u.total_xp >= 3000},
]


def get_or_create_default_user(session: Session) -> User:
    """
    Get the single local user, or create a default one if none exists.

    Args:
        session: Active SQLModel session.

    Returns:
        The User instance.
    """
    user = session.exec(select(User)).first()
    if not user:
        user = User(email="local@verdant.ai", lifestyle_classification="Getting started")
        session.add(user)
        session.commit()
        session.refresh(user)
    return user


def award_xp(user: User, session: Session, xp_amount: int = 10) -> User:
    """
    Award XP to a user and check for new achievements.

    Args:
        user: The User instance.
        session: Active SQLModel session.
        xp_amount: Amount of XP to award.

    Returns:
        Updated User instance.
    """
    user.total_xp += xp_amount
    user.current_level = _compute_level(user.total_xp)
    session.add(user)
    session.commit()
    session.refresh(user)
    _check_and_award_achievements(user, session)
    return user


def _compute_level(xp: int) -> int:
    """
    Compute numeric level from XP.

    Args:
        xp: Total XP.

    Returns:
        Integer level 1-5.
    """
    thresholds = [0, 500, 1500, 3500, 7000]
    for i, threshold in enumerate(reversed(thresholds)):
        if xp >= threshold:
            return len(thresholds) - i
    return 1


def _check_and_award_achievements(user: User, session: Session) -> None:
    """
    Check all achievement rules and unlock any newly earned badges.

    Args:
        user: The User instance.
        session: Active SQLModel session.
    """
    existing = {
        a.badge_name
        for a in session.exec(
            select(Achievement).where(Achievement.user_id == user.id)
        ).all()
    }
    for rule in ACHIEVEMENT_RULES:
        if rule["badge"] not in existing and rule["condition"](user):
            achievement = Achievement(user_id=user.id, badge_name=rule["badge"])
            session.add(achievement)
    session.commit()
