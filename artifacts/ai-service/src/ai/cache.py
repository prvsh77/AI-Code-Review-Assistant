"""In-memory LRU cache with TTL for identical code analyses."""
from __future__ import annotations

import hashlib
import time
from typing import Any

from cachetools import TTLCache
from loguru import logger

from .config import settings

_cache: TTLCache = TTLCache(
    maxsize=settings.cache_max_size,
    ttl=settings.cache_ttl_seconds,
)


def _make_key(agent: str, code: str, language: str, filename: str) -> str:
    payload = f"{agent}:{language}:{filename}:{code}"
    return hashlib.sha256(payload.encode()).hexdigest()


def get_cached(agent: str, code: str, language: str, filename: str) -> Any | None:
    key = _make_key(agent, code, language, filename)
    result = _cache.get(key)
    if result is not None:
        logger.debug(f"Cache HIT for agent={agent} key={key[:8]}")
    return result


def set_cached(agent: str, code: str, language: str, filename: str, value: Any) -> None:
    key = _make_key(agent, code, language, filename)
    _cache[key] = value
    logger.debug(f"Cache SET for agent={agent} key={key[:8]}")


def cache_stats() -> dict[str, Any]:
    return {
        "size": len(_cache),
        "maxsize": _cache.maxsize,
        "ttl": _cache.ttl,
    }
