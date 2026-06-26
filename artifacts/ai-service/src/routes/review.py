"""POST /ai/review — SSE streaming full multi-agent review."""
from __future__ import annotations

import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from loguru import logger

from ..ai.schemas import CodeInput
from ..ai.review_service import stream_full_review

router = APIRouter()


@router.post("/review")
async def review_code(body: CodeInput) -> StreamingResponse:
    """
    Stream a full 5-agent code review.
    Returns Server-Sent Events:
      data: {"type": "progress", "agent": str, "status": str, "step": int, "total": int}
      data: {"type": "result", "data": {...FullReviewResult...}}
      data: {"type": "error", "message": str}
    """
    async def event_stream():
        try:
            async for event in stream_full_review(body):
                yield f"data: {json.dumps(event)}\n\n"
        except Exception as e:
            logger.error(f"Review stream error: {e}")
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
