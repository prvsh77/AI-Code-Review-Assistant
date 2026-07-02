import pytest
from src.ai.ai_client import calculate_cost, call_llm, stream_llm, _extract_json

def test_calculate_cost():
    assert calculate_cost("gpt-4o-mini", 1_000_000, 1_000_000) == 0.75
    assert calculate_cost("gpt-4o", 1_000_000, 1_000_000) == 12.50
    assert calculate_cost("gemini-2.0-flash", 1_000_000, 1_000_000) == 0.375
    assert calculate_cost("unknown-model", 100, 100) == 0.0

def test_extract_json():
    # Markdown block
    raw_markdown = "```json\n{\"score\": 90}\n```"
    assert _extract_json(raw_markdown) == {"score": 90}
    
    # Extra surrounding text
    raw_extra = "Here is the response: {\"score\": 85} Hope that helps!"
    assert _extract_json(raw_extra) == {"score": 85}

@pytest.mark.asyncio
async def test_call_llm():
    res = await call_llm("System prompt", "User prompt")
    assert res["score"] == 90
    assert "_metadata" in res
    assert res["_metadata"]["model_used"] == "gpt-4o"

@pytest.mark.asyncio
async def test_stream_llm():
    tokens = []
    async for token in stream_llm("System prompt", "User prompt"):
        tokens.append(token)
    assert len(tokens) > 0
    assert "".join(tokens).strip() == "Mocked streaming token"
