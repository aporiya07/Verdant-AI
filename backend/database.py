"""
Database setup for Verdant AI using SQLModel and SQLite.
"""

from typing import Generator
from sqlmodel import Session, create_engine

# Use local SQLite database
DATABASE_URL: str = "sqlite:///./verdant.db"

# Create the SQLite engine
engine = create_engine(
    DATABASE_URL, echo=True, connect_args={"check_same_thread": False}
)

def get_session() -> Generator[Session, None, None]:
    """
    Dependency generator that provides a database session.
    
    Yields:
        Session: A SQLModel database session.
    """
    with Session(engine) as session:
        yield session
