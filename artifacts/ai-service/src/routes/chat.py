"""POST /ai/chat — streaming AI assistant."""
from __future__ import annotations

import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from loguru import logger

from ..ai.schemas import ChatRequest
from ..ai.prompts import CHAT_SYSTEM, build_chat_prompt
from ..ai.ai_client import stream_llm

router = APIRouter()


@router.post("/chat")
async def chat(body: ChatRequest) -> StreamingResponse:
    """
    Stream a chat response from the AI assistant.
    Returns Server-Sent Events:
      data: {"type": "token", "content": str}
      data: {"type": "done"}
    """
    history_text = "\n".join(
        f"{m.role.upper()}: {m.content}" for m in body.history[-10:]
    )
    system = CHAT_SYSTEM
    if history_text:
        system += f"\n\nConversation so far:\n{history_text}"

    user_prompt = build_chat_prompt(body.message, body.code_context, body.repository)

    async def event_stream():
        try:
            async for token in stream_llm(system, user_prompt):
                yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
        except Exception as e:
            logger.error(f"Chat stream error: {e}")
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
        finally:
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
