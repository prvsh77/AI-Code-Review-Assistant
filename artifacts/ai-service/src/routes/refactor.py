"""POST /ai/refactor — refactoring suggestions."""
from __future__ import annotations

from fastapi import APIRouter
from loguru import logger

from ..ai.schemas import CodeInput
from ..ai.review_service import run_refactoring

router = APIRouter()


@router.post("/refactor")
async def suggest_refactoring(body: CodeInput) -> dict:
    """Run the Refactoring Agent only and return structured JSON."""
    logger.info(f"Refactoring requested for {body.filename}")
    return await run_refactoring(body)
