from src.ai.config import settings

def test_settings_default_values():
    assert settings.llm_provider in ["openai", "anthropic", "gemini", "ollama"]
    assert settings.openai_model == "gpt-4o"
    assert settings.cache_ttl_seconds == 3600
    assert settings.cache_max_size == 256
