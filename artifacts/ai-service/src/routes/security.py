"""POST /ai/security — security-only analysis."""
from __future__ import annotations

from fastapi import APIRouter
from loguru import logger

from ..ai.schemas import CodeInput
from ..ai.review_service import run_security_review

router = APIRouter()


@router.post("/security")
async def security_scan(body: CodeInput) -> dict:
    """Run the Security Agent only and return structured JSON."""
    logger.info(f"Security scan requested for {body.filename}")
    return await run_security_review(body)
