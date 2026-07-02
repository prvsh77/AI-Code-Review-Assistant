import os
import sys

# Ensure root directory is in Python path for test execution
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from src.ai.config import settings

# Pre-configure mock API keys to force tests into calling simulated LLM providers instead of offline fallbacks
settings.openai_api_key = "mock-openai-key"
settings.anthropic_api_key = "mock-anthropic-key"
settings.google_api_key = "mock-google-key"

@pytest.fixture(autouse=True)
def clear_cache():
    """Clear the global LRU cache before each test to prevent cache leak/pollution."""
    from src.ai.cache import _cache
    _cache.clear()
    yield
    _cache.clear()

@pytest.fixture(autouse=True)
def mock_langchain_providers():
    """Mock Langchain Chat Clients to avoid real API network calls."""
    with patch("langchain_openai.ChatOpenAI") as mock_openai, \
         patch("langchain_anthropic.ChatAnthropic") as mock_anthropic, \
         patch("langchain_google_genai.ChatGoogleGenerativeAI") as mock_gemini:
        
        for mock_cls in [mock_openai, mock_anthropic, mock_gemini]:
            instance = mock_cls.return_value
            
            # Setup a standard JSON response representing successful agent analyses
            mock_response = MagicMock()
            mock_response.content = (
                '{"score": 90, "cyclomatic_complexity": 2, "cognitive_complexity": 2, '
                '"max_nesting_depth": 1, "long_functions": [], "issues": [], '
                '"summary": "Test run summary", "risk_level": "low", "owasp_categories": [], '
                '"strengths": ["Clear structure"], "improvements": ["None needed"], '
                '"missing_docs": [], "generated_readme": "Readme text", "function_docs": {}, '
                '"overall_score": 90, "quality_score": 90, "security_score": 90, '
                '"complexity_score": 90, "documentation_score": 90, "refactoring_score": 90, '
                '"suggestions": [], "design_patterns": [], "duplication_score": 0, '
                '"ai_summary": "Coordinator summary", "top_issues": []}'
            )
            mock_response.response_metadata = {
                "token_usage": {"prompt_tokens": 120, "completion_tokens": 80},
                "model_name": "gpt-4o"
            }
            instance.ainvoke = AsyncMock(return_value=mock_response)
            
            # Setup standard tokens generator for streaming tests
            async def mock_stream(*args, **kwargs):
                yield MagicMock(content="Mocked ")
                yield MagicMock(content="streaming ")
                yield MagicMock(content="token ")
            instance.astream = mock_stream
            
        yield
