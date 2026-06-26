"""GET /ai/healthz"""
from __future__ import annotations

from fastapi import APIRouter

from ..ai.cache import cache_stats
from ..ai.config import settings

router = APIRouter()


@router.get("/healthz")
async def health() -> dict:
    return {
        "status": "ok",
        "provider": settings.llm_provider,
        "model": {
            "openai": settings.openai_model,
            "anthropic": settings.anthropic_model,
            "gemini": settings.gemini_model,
            "ollama": settings.ollama_model,
        }.get(settings.llm_provider, "unknown"),
        "cache": cache_stats(),
    }
