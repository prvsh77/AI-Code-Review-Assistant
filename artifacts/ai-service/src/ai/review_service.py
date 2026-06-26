"""High-level review service — thin orchestration layer above agents."""
from __future__ import annotations

from typing import Any, AsyncIterator

from loguru import logger

from .agent_orchestrator import run_full_review_stream, run_single_agent
from .schemas import CodeInput, FullReviewResult


async def stream_full_review(code_input: CodeInput) -> AsyncIterator[dict[str, Any]]:
    """Stream a full multi-agent review."""
    logger.info(f"Starting full review: {code_input.filename} ({code_input.language})")
    async for event in run_full_review_stream(code_input):
        yield event


async def run_security_review(code_input: CodeInput) -> dict[str, Any]:
    logger.info(f"Security scan: {code_input.filename}")
    return await run_single_agent("security", code_input)


async def run_documentation(code_input: CodeInput) -> dict[str, Any]:
    logger.info(f"Documentation: {code_input.filename}")
    return await run_single_agent("documentation", code_input)


async def run_refactoring(code_input: CodeInput) -> dict[str, Any]:
    logger.info(f"Refactoring: {code_input.filename}")
    return await run_single_agent("refactoring", code_input)
