"""
Verdant AI — FastAPI Backend
A premium sustainability platform powered by Gemini AI.
"""
import logging
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.config import settings
from app.routers import auth, coach, futurecast, home, insight, onboarding

# Configure structured logging
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.stdlib.add_log_level,
        structlog.dev.ConsoleRenderer(),
    ]
)
logger = structlog.get_logger()

# Rate limiter
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Verdant AI API starting", environment=settings.environment)
    yield
    logger.info("Verdant AI API shutting down")


app = FastAPI(
    title="Verdant AI API",
    description="AI-powered sustainability platform — Hack2Skill PromptWars 2026",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — allow configured origins (includes Cloud Run frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(onboarding.router, prefix="/api/v1")
app.include_router(home.router, prefix="/api/v1")
app.include_router(coach.router, prefix="/api/v1")
app.include_router(futurecast.router, prefix="/api/v1")
app.include_router(insight.router, prefix="/api/v1")


@app.get("/", include_in_schema=False)
async def root():
    return JSONResponse({"service": "Verdant AI API", "status": "healthy", "version": "1.0.0"})


@app.get("/health", include_in_schema=False)
async def health():
    return {"status": "ok"}
