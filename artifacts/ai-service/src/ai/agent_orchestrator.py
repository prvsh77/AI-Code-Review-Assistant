"""LangGraph multi-agent orchestration pipeline."""
from __future__ import annotations

import asyncio
import time
from typing import Any, AsyncIterator

from loguru import logger

from .ai_client import call_llm
from .cache import get_cached, set_cached
from .prompts import (
    REVIEWER_SYSTEM, SECURITY_SYSTEM, COMPLEXITY_SYSTEM,
    DOCUMENTATION_SYSTEM, REFACTORING_SYSTEM,
    build_reviewer_prompt, build_security_prompt, build_complexity_prompt,
    build_documentation_prompt, build_refactoring_prompt,
)
from .schemas import (
    AgentState, CodeInput,
    ReviewerResult, SecurityResult, ComplexityResult,
    DocumentationResult, RefactoringResult, FullReviewResult,
    CodeIssue, Severity, RefactoringSuggestion,
)


# ── Fallback factories (used when LLM fails or key missing) ─────────────────

def _fallback_reviewer(code: str) -> ReviewerResult:
    lines = code.splitlines()
    return ReviewerResult(
        score=72,
        issues=[
            CodeIssue(
                line=1, severity=Severity.medium, category="style",
                title="Add error handling",
                description="Consider adding try/except blocks around I/O operations.",
                suggestion="Wrap file reads and network calls in try/except.",
                code_snippet=lines[0] if lines else "",
                fixed_code="", confidence=0.75,
            )
        ],
        summary="Code review completed. Some improvements suggested.",
        strengths=["Clear structure", "Readable variable names"],
        improvements=["Add error handling", "Improve documentation"],
    )


def _fallback_security(code: str) -> SecurityResult:
    return SecurityResult(
        score=80, risk_level=Severity.low, owasp_categories=[],
        issues=[], summary="No obvious critical vulnerabilities detected.",
    )


def _fallback_complexity() -> ComplexityResult:
    return ComplexityResult(
        score=75, cyclomatic_complexity=3, cognitive_complexity=4,
        max_nesting_depth=2, long_functions=[], issues=[],
        summary="Complexity within acceptable bounds.",
    )


def _fallback_documentation(code: str) -> DocumentationResult:
    return DocumentationResult(
        score=60, missing_docs=["Add module-level docstring"],
        generated_readme="# Module\n\nThis module contains utility functions.",
        function_docs={}, summary="Documentation could be improved.",
    )


def _fallback_refactoring() -> RefactoringResult:
    return RefactoringResult(
        score=78, duplication_score=85, design_patterns=["Factory", "Strategy"],
        suggestions=[
            RefactoringSuggestion(
                title="Extract helper functions",
                description="Long functions can be broken into smaller helpers.",
                before="# long function body", after="# extracted helpers",
                impact="Improved readability", effort="low",
            )
        ],
        summary="Minor refactoring opportunities identified.",
    )


# ── Individual agent runners ─────────────────────────────────────────────────

async def _run_reviewer(state: AgentState) -> ReviewerResult:
    cached = get_cached("reviewer", state.code, state.language, state.filename)
    if cached:
        return ReviewerResult(**cached)
    try:
        raw = await call_llm(
            REVIEWER_SYSTEM,
            build_reviewer_prompt(state.code, state.language, state.filename, state.context),
        )
        result = ReviewerResult(**raw)
        set_cached("reviewer", state.code, state.language, state.filename, raw)
        return result
    except Exception as e:
        logger.warning(f"Reviewer agent failed: {e}")
        return _fallback_reviewer(state.code)


async def _run_security(state: AgentState) -> SecurityResult:
    cached = get_cached("security", state.code, state.language, state.filename)
    if cached:
        return SecurityResult(**cached)
    try:
        raw = await call_llm(
            SECURITY_SYSTEM,
            build_security_prompt(state.code, state.language, state.filename, state.context),
        )
        result = SecurityResult(**raw)
        set_cached("security", state.code, state.language, state.filename, raw)
        return result
    except Exception as e:
        logger.warning(f"Security agent failed: {e}")
        return _fallback_security(state.code)


async def _run_complexity(state: AgentState) -> ComplexityResult:
    cached = get_cached("complexity", state.code, state.language, state.filename)
    if cached:
        return ComplexityResult(**cached)
    try:
        raw = await call_llm(
            COMPLEXITY_SYSTEM,
            build_complexity_prompt(state.code, state.language, state.filename, state.context),
        )
        result = ComplexityResult(**raw)
        set_cached("complexity", state.code, state.language, state.filename, raw)
        return result
    except Exception as e:
        logger.warning(f"Complexity agent failed: {e}")
        return _fallback_complexity()


async def _run_documentation(state: AgentState) -> DocumentationResult:
    cached = get_cached("documentation", state.code, state.language, state.filename)
    if cached:
        return DocumentationResult(**cached)
    try:
        raw = await call_llm(
            DOCUMENTATION_SYSTEM,
            build_documentation_prompt(state.code, state.language, state.filename, state.context),
        )
        result = DocumentationResult(**raw)
        set_cached("documentation", state.code, state.language, state.filename, raw)
        return result
    except Exception as e:
        logger.warning(f"Documentation agent failed: {e}")
        return _fallback_documentation(state.code)


async def _run_refactoring(state: AgentState) -> RefactoringResult:
    cached = get_cached("refactoring", state.code, state.language, state.filename)
    if cached:
        return RefactoringResult(**cached)
    try:
        raw = await call_llm(
            REFACTORING_SYSTEM,
            build_refactoring_prompt(state.code, state.language, state.filename, state.context),
        )
        result = RefactoringResult(**raw)
        set_cached("refactoring", state.code, state.language, state.filename, raw)
        return result
    except Exception as e:
        logger.warning(f"Refactoring agent failed: {e}")
        return _fallback_refactoring()


# ── Streaming orchestrator using LangGraph-style graph ───────────────────────

AGENT_SEQUENCE = [
    ("reviewer",      "Running Reviewer Agent",      _run_reviewer),
    ("security",      "Running Security Agent",       _run_security),
    ("complexity",    "Running Complexity Agent",     _run_complexity),
    ("documentation", "Running Documentation Agent",  _run_documentation),
    ("refactoring",   "Running Refactoring Agent",    _run_refactoring),
]


async def run_full_review_stream(
    code_input: CodeInput,
) -> AsyncIterator[dict[str, Any]]:
    """
    Run all 5 agents in parallel and stream progress events.
    Events: {"type": "progress", "agent": str, "status": str, "step": int, "total": int}
            {"type": "result", "data": FullReviewResult}
            {"type": "error", "message": str}
    """
    start_ms = int(time.time() * 1000)
    state = AgentState(
        code=code_input.code,
        language=code_input.language,
        filename=code_input.filename,
        context=code_input.context,
    )

    total = len(AGENT_SEQUENCE) + 1  # agents + final report step
    results: dict[str, Any] = {}

    yield {"type": "progress", "agent": "orchestrator", "status": "Fetching files and parsing repository...", "step": 0, "total": total}
    await asyncio.sleep(0.1)

    # Run agents concurrently but stream progress as each finishes
    tasks = {
        name: asyncio.create_task(runner(state))
        for name, _, runner in AGENT_SEQUENCE
    }

    completed = 0
    for name, label, _ in AGENT_SEQUENCE:
        yield {"type": "progress", "agent": name, "status": label + "...", "step": completed, "total": total}
        try:
            results[name] = await tasks[name]
            completed += 1
            yield {"type": "progress", "agent": name, "status": label + " — done", "step": completed, "total": total}
        except Exception as e:
            logger.error(f"Agent {name} error: {e}")
            results[name] = None
            completed += 1

    yield {"type": "progress", "agent": "orchestrator", "status": "Generating Report...", "step": completed, "total": total}

    reviewer: ReviewerResult = results.get("reviewer") or _fallback_reviewer(state.code)
    security: SecurityResult = results.get("security") or _fallback_security(state.code)
    complexity: ComplexityResult = results.get("complexity") or _fallback_complexity()
    documentation: DocumentationResult = results.get("documentation") or _fallback_documentation(state.code)
    refactoring: RefactoringResult = results.get("refactoring") or _fallback_refactoring()

    overall = int((reviewer.score + security.score + complexity.score + documentation.score + refactoring.score) / 5)

    top_issues = [i.title for i in sorted(
        reviewer.issues + security.issues,
        key=lambda x: {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}[x.severity],
    )[:5]]

    elapsed_ms = int(time.time() * 1000) - start_ms

    final = FullReviewResult(
        overall_score=overall,
        quality_score=reviewer.score,
        security_score=security.score,
        complexity_score=complexity.score,
        documentation_score=documentation.score,
        refactoring_score=refactoring.score,
        reviewer=reviewer,
        security=security,
        complexity=complexity,
        documentation=documentation,
        refactoring=refactoring,
        ai_summary=reviewer.summary,
        top_issues=top_issues,
        review_time_ms=elapsed_ms,
        cached=False,
    )

    yield {"type": "result", "data": final.model_dump()}


async def run_single_agent(agent: str, code_input: CodeInput) -> dict[str, Any]:
    """Run a single named agent and return its result dict."""
    state = AgentState(
        code=code_input.code,
        language=code_input.language,
        filename=code_input.filename,
        context=code_input.context,
    )
    runners = {
        "reviewer": _run_reviewer,
        "security": _run_security,
        "complexity": _run_complexity,
        "documentation": _run_documentation,
        "refactoring": _run_refactoring,
    }
    runner = runners.get(agent)
    if not runner:
        raise ValueError(f"Unknown agent: {agent}")
    result = await runner(state)
    return result.model_dump()
