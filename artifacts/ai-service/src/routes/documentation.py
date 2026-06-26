"""POST /ai/documentation — documentation generation."""
from __future__ import annotations

from fastapi import APIRouter
from loguru import logger

from ..ai.schemas import CodeInput
from ..ai.review_service import run_documentation

router = APIRouter()


@router.post("/documentation")
async def generate_documentation(body: CodeInput) -> dict:
    """Run the Documentation Agent only and return structured JSON."""
    logger.info(f"Documentation requested for {body.filename}")
    return await run_documentation(body)
