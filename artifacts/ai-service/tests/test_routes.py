import json
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_route_healthz():
    response = client.get("/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "cache" in data

def test_route_security():
    payload = {
        "code": "def run():\n  pass",
        "language": "python",
        "filename": "run.py"
    }
    response = client.post("/security", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 90
    assert "summary" in data

def test_route_documentation():
    payload = {
        "code": "def run():\n  pass",
        "language": "python",
        "filename": "run.py"
    }
    response = client.post("/documentation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 90
    assert "generated_readme" in data

def test_route_refactor():
    payload = {
        "code": "def run():\n  pass",
        "language": "python",
        "filename": "run.py"
    }
    response = client.post("/refactor", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 90
    assert "suggestions" in data

def test_route_review_stream():
    payload = {
        "code": "def compute():\n  return 42",
        "language": "python",
        "filename": "compute.py"
    }
    response = client.post("/review", json=payload)
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]
    
    # Verify stream content has expected events
    lines = response.text.split("\n\n")
    events = []
    for line in lines:
        if line.startswith("data: "):
            payload_str = line[6:]
            if payload_str == "[DONE]":
                break
            events.append(json.loads(payload_str))
            
    assert len(events) > 0
    # Must have a result event
    result = next((e for e in events if e.get("type") == "result"), None)
    assert result is not None
    assert result["data"]["overall_score"] == 90

def test_route_chat_stream():
    payload = {
        "message": "Explain cyclomatic complexity",
        "history": [
            {"role": "user", "content": "hello"},
            {"role": "assistant", "content": "hi"}
        ],
        "code_context": "def a(): pass",
        "repository": "my-repo"
    }
    response = client.post("/chat", json=payload)
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]
    
    lines = response.text.split("\n\n")
    events = []
    for line in lines:
        if line.startswith("data: "):
            payload_str = line[6:]
            event = json.loads(payload_str)
            events.append(event)
            if event.get("type") == "done":
                break
                
    assert len(events) > 0
    token_events = [e for e in events if e.get("type") == "token"]
    assert len(token_events) > 0
    assert token_events[0]["content"] == "Mocked "
