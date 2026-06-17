"""
Supabase database client wrapper.

Uses the Supabase Python client (REST via PostgREST) for all DB operations.
Falls back to a simple in-memory store when SUPABASE_URL is not configured,
so the demo works without a database connection.
"""
import json
import uuid
from datetime import datetime, timezone
from typing import Any

from app.config import settings


class InMemoryStore:
    """Lightweight in-memory fallback for local dev / demo without Supabase."""

    def __init__(self) -> None:
        self.users: dict[str, dict] = {}
        self.profiles: dict[str, dict] = {}
        self.messages: dict[str, list] = {}
        self._demo_ready = False

    def ensure_demo(self) -> dict:
        """Ensure the demo user exists and return it."""
        if not self._demo_ready:
            demo_id = "demo-user-000"
            self.users[demo_id] = {
                "id": demo_id,
                "email": settings.demo_user_email,
                "password_hash": None,
                "is_demo": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            self._demo_ready = True
        return next(u for u in self.users.values() if u.get("is_demo"))


_store: InMemoryStore | None = None
_supabase_client: Any = None


def _get_store() -> InMemoryStore:
    global _store
    if _store is None:
        _store = InMemoryStore()
    return _store


def _get_supabase():
    global _supabase_client
    if _supabase_client is None and settings.supabase_url and settings.supabase_anon_key:
        from supabase import create_client
        _supabase_client = create_client(settings.supabase_url, settings.supabase_anon_key)
    return _supabase_client


def _use_supabase() -> bool:
    return bool(settings.supabase_url and settings.supabase_anon_key)


# ---------------------------------------------------------------------------
# User operations
# ---------------------------------------------------------------------------

async def get_user_by_email(email: str) -> dict | None:
    if _use_supabase():
        sb = _get_supabase()
        res = sb.table("users").select("*").eq("email", email).limit(1).execute()
        return res.data[0] if res.data else None
    store = _get_store()
    return next((u for u in store.users.values() if u["email"] == email), None)


async def create_user(email: str, password_hash: str | None, is_demo: bool = False) -> dict:
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": email,
        "password_hash": password_hash,
        "is_demo": is_demo,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    if _use_supabase():
        sb = _get_supabase()
        res = sb.table("users").insert(user).execute()
        return res.data[0]
    _get_store().users[user_id] = user
    return user


async def get_user_by_id(user_id: str) -> dict | None:
    if _use_supabase():
        sb = _get_supabase()
        res = sb.table("users").select("*").eq("id", user_id).limit(1).execute()
        return res.data[0] if res.data else None
    return _get_store().users.get(user_id)


# ---------------------------------------------------------------------------
# Profile operations
# ---------------------------------------------------------------------------

async def get_profile(user_id: str) -> dict | None:
    if _use_supabase():
        sb = _get_supabase()
        res = sb.table("user_profiles").select("*").eq("user_id", user_id).limit(1).execute()
        return res.data[0] if res.data else None
    return _get_store().profiles.get(user_id)


async def upsert_profile(user_id: str, data: dict) -> dict:
    profile = {"user_id": user_id, "updated_at": datetime.now(timezone.utc).isoformat(), **data}
    if _use_supabase():
        sb = _get_supabase()
        res = sb.table("user_profiles").upsert(profile).execute()
        return res.data[0]
    store = _get_store()
    existing = store.profiles.get(user_id, {})
    existing.update(profile)
    store.profiles[user_id] = existing
    return existing


# ---------------------------------------------------------------------------
# Message operations
# ---------------------------------------------------------------------------

async def add_message(user_id: str, role: str, content: str) -> dict:
    msg = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "role": role,
        "content": content,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    if _use_supabase():
        sb = _get_supabase()
        res = sb.table("eco_coach_messages").insert(msg).execute()
        return res.data[0]
    store = _get_store()
    if user_id not in store.messages:
        store.messages[user_id] = []
    store.messages[user_id].append(msg)
    # Keep only last 20 messages
    store.messages[user_id] = store.messages[user_id][-20:]
    return msg


async def get_messages(user_id: str, limit: int = 20) -> list[dict]:
    if _use_supabase():
        sb = _get_supabase()
        res = (
            sb.table("eco_coach_messages")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return list(reversed(res.data))
    store = _get_store()
    msgs = store.messages.get(user_id, [])
    return msgs[-limit:]
