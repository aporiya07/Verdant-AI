"""Authentication routes: demo one-click + optional email/password."""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

from app import database as db
from app.config import settings
from app.deps import get_current_user
from app.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    is_demo: bool = False


@router.post("/demo", response_model=TokenResponse, summary="One-click demo session")
async def demo_login():
    """Create or return the demo user and issue a JWT. No password required."""
    user = await db.get_user_by_email(settings.demo_user_email)
    if not user:
        user = await db.create_user(
            email=settings.demo_user_email,
            password_hash=None,
            is_demo=True,
        )
    token = create_access_token({"sub": user["id"], "email": user["email"], "is_demo": True})
    return TokenResponse(access_token=token, user_id=user["id"], is_demo=True)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest):
    """Register with email and password."""
    existing = await db.get_user_by_email(req.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    if len(req.password) < 6:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Password must be at least 6 characters")
    user = await db.create_user(email=req.email, password_hash=hash_password(req.password))
    # Create empty profile with display name
    display_name = req.display_name or req.email.split("@")[0].capitalize()
    await db.upsert_profile(user["id"], {"display_name": display_name})
    token = create_access_token({"sub": user["id"], "email": user["email"], "is_demo": False})
    return TokenResponse(access_token=token, user_id=user["id"])


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    """Log in with email and password."""
    user = await db.get_user_by_email(req.email)
    if not user or not user.get("password_hash"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": user["id"], "email": user["email"], "is_demo": False})
    return TokenResponse(access_token=token, user_id=user["id"])


@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)):
    """Return current user's basic info."""
    user = await db.get_user_by_id(current_user["sub"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    profile = await db.get_profile(current_user["sub"]) or {}
    return {
        "id": user["id"],
        "email": user["email"],
        "is_demo": user.get("is_demo", False),
        "display_name": profile.get("display_name", ""),
        "has_onboarded": bool(profile.get("green_score")),
    }
