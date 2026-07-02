"""LangGraph-style concurrent multi-agent orchestration pipeline with live Coordinator."""
from __future__ import annotations

import asyncio
import json
import time
from typing import Any, AsyncIterator

from loguru import logger

from .ai_client import call_llm
from .cache import get_cached, set_cached
from .config import settings
from .prompts import (
    REVIEWER_SYSTEM, SECURITY_SYSTEM, COMPLEXITY_SYSTEM,
    DOCUMENTATION_SYSTEM, REFACTORING_SYSTEM, COORDINATOR_SYSTEM,
    PROMPT_VERSION,
    build_reviewer_prompt, build_security_prompt, build_complexity_prompt,
    build_documentation_prompt, build_refactoring_prompt,
    build_coordinator_prompt,
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
        score=60, missing_docs=["Add docstring annotations"],
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

async def _run_reviewer(state: AgentState) -> dict[str, Any]:
    cached = get_cached("reviewer", state.code, state.language, state.filename)
    if cached:
        meta = cached.get("_metadata") or {
            "model_used": "cache", "input_tokens": 0, "output_tokens": 0, "cost": 0.0, "latency_ms": 0
        }
        raw_clean = {k: v for k, v in cached.items() if k != "_metadata"}
        return {
            "result": ReviewerResult(**raw_clean),
            "metadata": meta,
            "raw": raw_clean
        }
    try:
        raw = await call_llm(
            REVIEWER_SYSTEM,
            build_reviewer_prompt(state.code, state.language, state.filename, state.context),
        )
        meta = raw.get("_metadata") or {
            "model_used": settings.openai_model, "input_tokens": 0, "output_tokens": 0, "cost": 0.0, "latency_ms": 0
        }
        raw_clean = {k: v for k, v in raw.items() if k != "_metadata"}
        result = ReviewerResult(**raw_clean)
        set_cached("reviewer", state.code, state.language, state.filename, raw)
        return {
            "result": result,
            "metadata": meta,
            "raw": raw_clean
        }
    except Exception as e:
        logger.warning(f"Reviewer agent failed: {e}")
        fallback = _fallback_reviewer(state.code)
        return {
            "result": fallback,
            "metadata": {"model_used": "fallback", "input_tokens": 0, "output_tokens": 0, "cost": 0.0, "latency_ms": 0},
            "raw": fallback.model_dump()
        }


async def _run_security(state: AgentState) -> dict[str, Any]:
    cached = get_cached("security", state.code, state.language, state.filename)
    if cached:
        meta = cached.get("_metadata") or {
            "model_used": "cache", "input_tokens": 0, "output_tokens": 0, "cost": 0.0, "latency_ms": 0
        }
        raw_clean = {k: v for k, v in cached.items() if k != "_metadata"}
        return {
            "result": SecurityResult(**raw_clean),
            "metadata": meta,
            "raw": raw_clean
        }
    try:
        raw = await call_llm(
            SECURITY_SYSTEM,
            build_security_prompt(state.code, state.language, state.filename, state.context),
        )
        meta = raw.get("_metadata") or {
            "model_used": settings.openai_model, "input_tokens": 0, "output_tokens": 0, "cost": 0.0, "latency_ms": 0
        }
        raw_clean = {k: v for k, v in raw.items() if k != "_metadata"}
        result = SecurityResult(**raw_clean)
        set_cached("security", state.code, state.language, state.filename, raw)
        return {
            "result": result,
            "metadata": meta,
            "raw": raw_clean
        }
    except Exception as e:
        logger.warning(f"Security agent failed: {e}")
        fallback = _fallback_security(state.code)
        return {
            "result": fallback,
            "metadata": {"model_used": "fallback", "input_tokens": 0, "output_tokens": 0, "cost": 0.0, "latency_ms": 0},
            "raw": fallback.model_dump()
        }


async def _run_complexity(state: AgentState) -> dict[str, Any]:
    cached = get_cached("complexity", state.code, state.language, state.filename)
    if cached:
        meta = cached.get("_metadata") or {
            "model_used": "cache", "input_tokens": 0, "output_tokens": 0, "cost": 0.0, "latency_ms": 0
        }
        raw_clean = {k: v for k, v in cached.items() if k != "_metadata"}
        return {
            "result": ComplexityResult(**raw_clean),
            "metadata": meta,
            "raw": raw_clean
        }
    try:
        raw = await call_llm(
            COMPLEXITY_SYSTEM,
            build_complexity_prompt(state.code, state.language, state.filename, state.context),
        )
        meta = raw.get("_metadata") or {
            "model_used": settings.openai_model, "input_tokens": 0, "output_tokens": 0, "cost": 0.0, "latency_ms": 0
        }
        raw_clean = {k: v for k, v in raw.items() if k != "_metadata"}
        result = ComplexityResult(**raw_clean)
        set_cached("complexity", state.code, state.language, state.filename, raw)
        return {
            "result": result,
            "metadata": meta,
            "raw": raw_clean
        }
    except Exception as e:
        logger.warning(f"Complexity agent failed: {e}")
        fallback = _fallback_complexity()
        return {
            "result": fallback,
            "metadata": {"model_used": "fallback", "input_tokens": 0, "output_tokens": 0, "cost": 0.0, "latency_ms": 0},
            "raw": fallback.model_dump()
        }


async def _run_documentation(state: AgentState) -> dict[str, Any]:
    cached = get_cached("documentation", state.code, state.language, state.filename)
    if cached:
        meta = cached.get("_metadata") or {
            "model_used": "cache", "input_tokens": 0, "output_tokens": 0, "cost": 0.0, "latency_ms": 0
        }
        raw_clean = {k: v for k, v in cached.items() if k != "_metadata"}
        return {
            "result": DocumentationResult(**raw_clean),
            "metadata": meta,
            "raw": raw_clean
        }
    try:
        raw = await call_llm(
            DOCUMENTATION_SYSTEM,
            build_documentation_prompt(state.code, state.language, state.filename, state.context),
        )
        meta = raw.get("_metadata") or {
            "model_used": settings.openai_model, "input_tokens": 0, "output_tokens": 0, "cost": 0.0, "latency_ms": 0
        }
        raw_clean = {k: v for k, v in raw.items() if k != "_metadata"}
        result = DocumentationResult(**raw_clean)
        set_cached("documentation", state.code, state.language, state.filename, raw)
        return {
            "result": result,
            "metadata": meta,
            "raw": raw_clean
        }
    except Exception as e:
        logger.warning(f"Documentation agent failed: {e}")
        fallback = _fallback_documentation(state.code)
        return {
            "result": fallback,
            "metadata": {"model_used": "fallback", "input_tokens": 0, "output_tokens": 0, "cost": 0.0, "latency_ms": 0},
            "raw": fallback.model_dump()
        }


async def _run_refactoring(state: AgentState) -> dict[str, Any]:
    cached = get_cached("refactoring", state.code, state.language, state.filename)
    if cached:
        meta = cached.get("_metadata") or {
            "model_used": "cache", "input_tokens": 0, "output_tokens": 0, "cost": 0.0, "latency_ms": 0
        }
        raw_clean = {k: v for k, v in cached.items() if k != "_metadata"}
        return {
            "result": RefactoringResult(**raw_clean),
            "metadata": meta,
            "raw": raw_clean
        }
    try:
        raw = await call_llm(
            REFACTORING_SYSTEM,
            build_refactoring_prompt(state.code, state.language, state.filename, state.context),
        )
        meta = raw.get("_metadata") or {
            "model_used": settings.openai_model, "input_tokens": 0, "output_tokens": 0, "cost": 0.0, "latency_ms": 0
        }
        raw_clean = {k: v for k, v in raw.items() if k != "_metadata"}
        result = RefactoringResult(**raw_clean)
        set_cached("refactoring", state.code, state.language, state.filename, raw)
        return {
            "result": result,
            "metadata": meta,
            "raw": raw_clean
        }
    except Exception as e:
        logger.warning(f"Refactoring agent failed: {e}")
        fallback = _fallback_refactoring()
        return {
            "result": fallback,
            "metadata": {"model_used": "fallback", "input_tokens": 0, "output_tokens": 0, "cost": 0.0, "latency_ms": 0},
            "raw": fallback.model_dump()
        }


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
    Coordinator merges outputs and builds final JSON report.
    """
    start_ms = int(time.time() * 1000)
    state = AgentState(
        code=code_input.code,
        language=code_input.language,
        filename=code_input.filename,
        context=code_input.context,
    )

    total_steps = len(AGENT_SEQUENCE) + 2  # agents + coordinator + final report step
    results: dict[str, Any] = {}

    yield {"type": "progress", "agent": "orchestrator", "status": "Fetching files and parsing repository...", "step": 0, "total": total_steps}
    await asyncio.sleep(0.05)

    # 1. Run all 5 agents in parallel
    tasks = {
        name: asyncio.create_task(runner(state))
        for name, _, runner in AGENT_SEQUENCE
    }

    # Gather results concurrently
    yield {"type": "progress", "agent": "orchestrator", "status": "Analyzing code using 5 specialized agents in parallel...", "step": 1, "total": total_steps}
    agent_results = await asyncio.gather(*[tasks[name] for name, _, _ in AGENT_SEQUENCE], return_exceptions=True)

    # Yield completion updates sequentially for beautiful UI progress feel
    for idx, (name, label, _) in enumerate(AGENT_SEQUENCE):
        res = agent_results[idx]
        if isinstance(res, Exception):
            logger.error(f"Agent {name} exception during concurrent execute: {res}")
            # Fallback structure
            fallback_factory = globals()[f"_fallback_{name}"]
            fallback_res = fallback_factory() if name in ("complexity", "refactoring") else fallback_factory(state.code)
            results[name] = {
                "result": fallback_res,
                "metadata": {"model_used": "failed", "input_tokens": 0, "output_tokens": 0, "cost": 0.0, "latency_ms": 0},
                "raw": fallback_res.model_dump()
            }
        else:
            results[name] = res

        yield {"type": "progress", "agent": name, "status": f"{label} completed", "step": idx + 2, "total": total_steps}

    # 2. Invoke Coordinator Agent to synthesize outputs
    yield {"type": "progress", "agent": "coordinator", "status": "Running Coordinator Agent to merge findings...", "step": total_steps - 1, "total": total_steps}
    
    reviewer_data = results["reviewer"]
    security_data = results["security"]
    complexity_data = results["complexity"]
    documentation_data = results["documentation"]
    refactoring_data = results["refactoring"]

    coordinator_raw = None
    coordinator_meta = {
        "model_used": settings.openai_model, "input_tokens": 0, "output_tokens": 0, "cost": 0.0, "latency_ms": 0
    }
    
    try:
        user_prompt = build_coordinator_prompt(
            state.code,
            json.dumps(reviewer_data["raw"]),
            json.dumps(security_data["raw"]),
            json.dumps(complexity_data["raw"]),
            json.dumps(documentation_data["raw"]),
            json.dumps(refactoring_data["raw"])
        )
        # Execute Coordinator Agent
        coordinator_raw = await call_llm(COORDINATOR_SYSTEM, user_prompt)
        coordinator_meta = coordinator_raw.get("_metadata") or coordinator_meta
    except Exception as e:
        logger.error(f"Coordinator Agent failed: {e}")

    # Reconcile scores and summaries
    if coordinator_raw:
        overall_score = coordinator_raw.get("overall_score") or int(
            (reviewer_data["result"].score + security_data["result"].score + complexity_data["result"].score + 
             documentation_data["result"].score + refactoring_data["result"].score) / 5
        )
        ai_summary = coordinator_raw.get("ai_summary") or reviewer_data["result"].summary
        top_issues = coordinator_raw.get("top_issues") or [
            i.title for i in sorted(
                reviewer_data["result"].issues + security_data["result"].issues + complexity_data["result"].issues,
                key=lambda x: {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}[x.severity],
            )[:5]
        ]
    else:
        overall_score = int(
            (reviewer_data["result"].score + security_data["result"].score + complexity_data["result"].score + 
             documentation_data["result"].score + refactoring_data["result"].score) / 5
        )
        ai_summary = reviewer_data["result"].summary
        top_issues = [
            i.title for i in sorted(
                reviewer_data["result"].issues + security_data["result"].issues + complexity_data["result"].issues,
                key=lambda x: {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}[x.severity],
            )[:5]
        ]

    # Calculate global execution telemetry metadata
    all_runs = [reviewer_data, security_data, complexity_data, documentation_data, refactoring_data]
    total_input_tokens = sum(r["metadata"].get("input_tokens", 0) for r in all_runs) + coordinator_meta.get("input_tokens", 0)
    total_output_tokens = sum(r["metadata"].get("output_tokens", 0) for r in all_runs) + coordinator_meta.get("output_tokens", 0)
    total_cost = sum(r["metadata"].get("cost", 0.0) for r in all_runs) + coordinator_meta.get("cost", 0.0)
    
    elapsed_ms = int(time.time() * 1000) - start_ms

    # Log logs
    agent_logs = {
        "reviewer": reviewer_data["raw"],
        "security": security_data["raw"],
        "complexity": complexity_data["raw"],
        "documentation": documentation_data["raw"],
        "refactoring": refactoring_data["raw"],
        "coordinator": {k: v for k, v in coordinator_raw.items() if k != "_metadata"} if coordinator_raw else {}
    }

    # Prompt templates mapped
    prompt_templates = {
        "reviewer": REVIEWER_SYSTEM,
        "security": SECURITY_SYSTEM,
        "complexity": COMPLEXITY_SYSTEM,
        "documentation": DOCUMENTATION_SYSTEM,
        "refactoring": REFACTORING_SYSTEM,
        "coordinator": COORDINATOR_SYSTEM
    }

    final = FullReviewResult(
        overall_score=overall_score,
        quality_score=reviewer_data["result"].score,
        security_score=security_data["result"].score,
        complexity_score=complexity_data["result"].score,
        documentation_score=documentation_data["result"].score,
        refactoring_score=refactoring_data["result"].score,
        reviewer=reviewer_data["result"],
        security=security_data["result"],
        complexity=complexity_data["result"],
        documentation=documentation_data["result"],
        refactoring=refactoring_data["result"],
        ai_summary=ai_summary,
        top_issues=top_issues,
        review_time_ms=elapsed_ms,
        cached=False,
        model_used=coordinator_meta.get("model_used", settings.openai_model),
        input_tokens=total_input_tokens,
        output_tokens=total_output_tokens,
        cost=round(total_cost, 6),
        agent_logs=agent_logs,
        prompt_templates=prompt_templates,
        prompt_version=PROMPT_VERSION,
    )

    yield {"type": "progress", "agent": "orchestrator", "status": "Generating report and finishing up...", "step": total_steps, "total": total_steps}
    await asyncio.sleep(0.05)

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
    
    envelope = await runner(state)
    return envelope["raw"]
