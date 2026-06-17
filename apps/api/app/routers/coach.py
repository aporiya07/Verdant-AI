"""EcoCoach streaming chat route."""
import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app import database as db
from app.deps import get_current_user
from app.services.gemini_client import stream_eco_coach

router = APIRouter(prefix="/coach", tags=["coach"])


class ChatRequest(BaseModel):
    message: str


@router.post("/chat", summary="Stream EcoCoach response with profile context")
async def chat(req: ChatRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    profile = await db.get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Complete onboarding to activate EcoCoach.")

    # Persist user message
    await db.add_message(user_id, "user", req.message)

    # Get recent history for context
    history = await db.get_messages(user_id, limit=10)

    async def generate():
        full_response = ""
        try:
            stream = await stream_eco_coach(req.message, profile, history)
            async for chunk in stream:
                full_response += chunk
                yield f"data: {json.dumps({'text': chunk})}\n\n"
        except Exception as e:
            fallback = "I'm having trouble connecting right now. Try reducing your biggest emission source first — it's usually transport or diet."
            yield f"data: {json.dumps({'text': fallback})}\n\n"
            full_response = fallback

        # Persist assistant reply
        await db.add_message(user_id, "assistant", full_response)
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.get("/history", summary="Recent conversation history")
async def history(current_user: dict = Depends(get_current_user)):
    messages = await db.get_messages(current_user["sub"], limit=20)
    return {"messages": messages}
