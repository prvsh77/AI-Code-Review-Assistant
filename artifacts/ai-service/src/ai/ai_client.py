"""Provider-agnostic LLM client. Switch provider by setting LLM_PROVIDER env var."""
from __future__ import annotations

import json
import re
from typing import Any, AsyncIterator

from loguru import logger
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)

from .config import settings


def _build_llm(streaming: bool = False) -> Any:
    """Build an LLM instance based on the configured provider."""
    provider = settings.llm_provider.lower()

    if provider == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=settings.openai_model,
            api_key=settings.openai_api_key,
            streaming=streaming,
            max_retries=0,
        )
    elif provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            model=settings.anthropic_model,
            api_key=settings.anthropic_api_key,
            streaming=streaming,
            max_retries=0,
        )
    elif provider == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            model=settings.gemini_model,
            google_api_key=settings.google_api_key,
            streaming=streaming,
        )
    elif provider == "ollama":
        from langchain_community.chat_models import ChatOllama
        return ChatOllama(
            model=settings.ollama_model,
            base_url=settings.ollama_base_url,
        )
    else:
        raise ValueError(f"Unsupported LLM provider: {provider}")


def _extract_json(text: str) -> dict[str, Any]:
    """Extract JSON from LLM response, handling markdown code blocks."""
    text = text.strip()
    # Remove markdown code fences
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    # Find first { to last }
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        text = text[start : end + 1]
    return json.loads(text)


def calculate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
    model = model.lower()
    if "gpt-4o-mini" in model:
        return (input_tokens * 0.15 + output_tokens * 0.60) / 1_000_000
    elif "gpt-4o" in model:
        return (input_tokens * 2.50 + output_tokens * 10.00) / 1_000_000
    elif "gpt-4" in model:
        return (input_tokens * 30.00 + output_tokens * 60.00) / 1_000_000
    elif "claude-3-5" in model:
        return (input_tokens * 3.00 + output_tokens * 15.00) / 1_000_000
    elif "gemini" in model:
        return (input_tokens * 0.075 + output_tokens * 0.30) / 1_000_000
    return 0.0


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(Exception),
    reraise=True,
)
async def call_llm(system: str, user: str) -> dict[str, Any]:
    """Call the LLM with system + user prompt and return parsed JSON."""
    import asyncio
    import time

    llm = _build_llm(streaming=False)
    from langchain_core.messages import SystemMessage, HumanMessage

    messages = [SystemMessage(content=system), HumanMessage(content=user)]
    logger.debug(f"Calling {settings.llm_provider} LLM")

    start_time = time.time()
    # Apply a 35s timeout to the network call
    response = await asyncio.wait_for(llm.ainvoke(messages), timeout=35.0)
    latency_ms = int((time.time() - start_time) * 1000)

    content = response.content if hasattr(response, "content") else str(response)

    try:
        parsed = _extract_json(content)
    except json.JSONDecodeError:
        logger.warning(f"Failed to parse JSON, returning raw: {content[:200]}")
        raise ValueError(f"LLM returned non-JSON: {content[:500]}")

    # Extract token usage and compute cost
    meta = getattr(response, "response_metadata", {}) or {}
    token_usage = meta.get("token_usage", {}) or {}
    input_tokens = token_usage.get("prompt_tokens", 0)
    output_tokens = token_usage.get("completion_tokens", 0)
    
    # Model resolution
    resolved_model = meta.get("model_name", "") or settings.openai_model
    if not resolved_model:
        provider = settings.llm_provider.lower()
        resolved_model = settings.openai_model if provider == "openai" else settings.gemini_model

    cost = calculate_cost(resolved_model, input_tokens, output_tokens)

    # Attach hidden metadata block
    parsed["_metadata"] = {
        "model_used": resolved_model,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "cost": cost,
        "latency_ms": latency_ms,
    }

    return parsed


async def stream_llm(system: str, user: str) -> AsyncIterator[str]:
    """Stream tokens from the LLM for chat-style responses."""
    provider = settings.llm_provider.lower()
    
    # Check if key is configured for SaaS providers
    has_key = True
    if provider == "openai" and not settings.openai_api_key:
        has_key = False
    elif provider == "anthropic" and not settings.anthropic_api_key:
        has_key = False
    elif provider == "gemini" and not settings.google_api_key:
        has_key = False
        
    if not has_key and provider != "ollama":
        fallback_msg = (
            "Hello! I am currently running in offline demonstration mode because no LLM API key has been "
            "configured. You can connect me to a live assistant by adding your `OPENAI_API_KEY` (or other "
            "provider keys) to the `artifacts/ai-service/.env` file.\n\n"
            "Here is how you can improve your code's complexity score:\n"
            "1. **Break down large functions**: Keep functions under 30 lines of code.\n"
            "2. **Reduce nesting**: Avoid deep if-else trees by using guard clauses.\n"
            "3. **Extract helper methods**: Split reusable logic into independent, pure helper functions."
        )
        import asyncio
        for word in fallback_msg.split(" "):
            yield word + " "
            await asyncio.sleep(0.02)
        return

    try:
        llm = _build_llm(streaming=True)
        from langchain_core.messages import SystemMessage, HumanMessage

        messages = [SystemMessage(content=system), HumanMessage(content=user)]
        logger.debug(f"Streaming from {settings.llm_provider} LLM")

        async for chunk in llm.astream(messages):
            content = chunk.content if hasattr(chunk, "content") else str(chunk)
            if content:
                yield content
    except Exception as e:
        logger.warning(f"Streaming LLM failed: {e}")
        fallback_msg = (
            f"An error occurred while streaming from the LLM: {str(e)}\n\n"
            "Falling back to local simulation mode:\n"
            "To resolve this, please check your network connection and verify your API keys in `.env`."
        )
        import asyncio
        for word in fallback_msg.split(" "):
            yield word + " "
            await asyncio.sleep(0.02)
