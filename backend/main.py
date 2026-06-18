"""
Main FastAPI application entry point for Verdant AI.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from database import engine
from config import settings
from routers import carbon, ai, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager — create DB tables on startup."""
    SQLModel.metadata.create_all(engine)
    yield


app = FastAPI(
    title="Verdant AI API",
    description="Backend services for the Verdant AI sustainability platform.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(carbon.router)
app.include_router(ai.router)


@app.get("/", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "message": "Verdant AI API is running 🌱"}
