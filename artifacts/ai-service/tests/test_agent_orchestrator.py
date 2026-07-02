import pytest
from unittest.mock import patch, AsyncMock
from src.ai.schemas import CodeInput
from src.ai.agent_orchestrator import run_full_review_stream, _fallback_reviewer

def test_fallback_reviewer():
    res = _fallback_reviewer("def hello():\n  pass")
    assert res.score == 72
    assert len(res.issues) == 1
    assert res.issues[0].category == "style"

@pytest.mark.asyncio
async def test_run_full_review_stream():
    code_input = CodeInput(
        code="def add(a, b):\n  return a + b",
        language="python",
        filename="math.py",
        context="No specific context"
    )
    
    events = []
    async for event in run_full_review_stream(code_input):
        events.append(event)
        
    assert len(events) > 0
    result_event = next((e for e in events if e.get("type") == "result"), None)
    assert result_event is not None
    assert "data" in result_event
    assert result_event["data"]["overall_score"] == 90
    assert result_event["data"]["quality_score"] == 90

@pytest.mark.asyncio
async def test_run_full_review_stream_exception_fallback():
    # Force call_llm to raise exception to test agent fallback path
    with patch("src.ai.agent_orchestrator.call_llm", side_effect=Exception("LLM error")):
        code_input = CodeInput(
            code="def add_fallback(a, b):\n  return a + b",
            language="python",
            filename="math.py"
        )
        
        events = []
        async for event in run_full_review_stream(code_input):
            events.append(event)
            
        result_event = next((e for e in events if e.get("type") == "result"), None)
        assert result_event is not None
        assert result_event["data"]["overall_score"] < 90
