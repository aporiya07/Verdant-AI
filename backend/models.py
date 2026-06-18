"""
Database models and Pydantic schemas for Verdant AI.
"""

from datetime import datetime, timezone
import uuid
from typing import Optional, Dict, Any
from sqlmodel import SQLModel, Field, Column, JSON
from pydantic import BaseModel

class CarbonDnaData(BaseModel):
    """
    Pydantic model representing structured Carbon DNA input data.
    """
    transport: str
    energy: str
    food: str
    shopping: str
    waste: str

class UserBase(SQLModel):
    """
    Base properties for the User model.
    """
    email: str = Field(index=True, unique=True)
    lifestyle_classification: Optional[str] = Field(default=None)
    sustainability_score: int = Field(default=0)
    total_xp: int = Field(default=0)
    current_level: int = Field(default=1)

class User(UserBase, table=True):
    """
    Database representation of a User.
    """
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    carbon_dna: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CarbonLogBase(SQLModel):
    """
    Base properties for a Carbon Log entry.
    """
    user_id: str = Field(foreign_key="user.id")
    category: str
    emissions_kg: float

class CarbonLog(CarbonLogBase, table=True):
    """
    Database representation of a Carbon Log.
    """
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    details: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    logged_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AchievementBase(SQLModel):
    """
    Base properties for an Achievement.
    """
    user_id: str = Field(foreign_key="user.id")
    badge_name: str

class Achievement(AchievementBase, table=True):
    """
    Database representation of an Achievement.
    """
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    unlocked_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AiInsightBase(SQLModel):
    """
    Base properties for an AI Insight.
    """
    user_id: str = Field(foreign_key="user.id")
    insight_type: str
    content: str

class AiInsight(AiInsightBase, table=True):
    """
    Database representation of an AI Insight.
    """
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
