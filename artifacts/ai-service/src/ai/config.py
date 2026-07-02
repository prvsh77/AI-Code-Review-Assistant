"""Central configuration — change LLM_PROVIDER to switch between providers."""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # ── Provider selection ──────────────────────────────────────────────────
    # Set to: openai | anthropic | gemini | ollama
    llm_provider: str = "openai"

    # ── OpenAI ─────────────────────────────────────────────────────────────
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"

    # ── Anthropic ──────────────────────────────────────────────────────────
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-3-5-haiku-20241022"

    # ── Google Gemini ──────────────────────────────────────────────────────
    google_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"

    # ── Ollama (local) ─────────────────────────────────────────────────────
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2"

    # ── Server ─────────────────────────────────────────────────────────────
    port: int = 8085
    log_level: str = "INFO"

    # ── Cache ──────────────────────────────────────────────────────────────
    cache_ttl_seconds: int = 3600
    cache_max_size: int = 256


settings = Settings()
