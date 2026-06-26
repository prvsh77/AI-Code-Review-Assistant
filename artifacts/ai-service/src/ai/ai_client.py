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


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(Exception),
    reraise=True,
)
async def call_llm(system: str, user: str) -> dict[str, Any]:
    """Call the LLM with system + user prompt and return parsed JSON."""
    llm = _build_llm(streaming=False)
    from langchain_core.messages import SystemMessage, HumanMessage

    messages = [SystemMessage(content=system), HumanMessage(content=user)]
    logger.debug(f"Calling {settings.llm_provider} LLM")

    response = await llm.ainvoke(messages)
    content = response.content if hasattr(response, "content") else str(response)

    try:
        return _extract_json(content)
    except json.JSONDecodeError:
        logger.warning(f"Failed to parse JSON, returning raw: {content[:200]}")
        raise ValueError(f"LLM returned non-JSON: {content[:500]}")


async def stream_llm(system: str, user: str) -> AsyncIterator[str]:
    """Stream tokens from the LLM for chat-style responses."""
    llm = _build_llm(streaming=True)
    from langchain_core.messages import SystemMessage, HumanMessage

    messages = [SystemMessage(content=system), HumanMessage(content=user)]
    logger.debug(f"Streaming from {settings.llm_provider} LLM")

    async for chunk in llm.astream(messages):
        content = chunk.content if hasattr(chunk, "content") else str(chunk)
        if content:
            yield content
