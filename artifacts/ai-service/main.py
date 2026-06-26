"""FastAPI entry point for the AI Code Review service."""
from __future__ import annotations

import os
import sys

# Add src to path so relative imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger

from src.ai.config import settings
from src.routes.review import router as review_router
from src.routes.security import router as security_router
from src.routes.documentation import router as documentation_router
from src.routes.refactor import router as refactor_router
from src.routes.chat import router as chat_router
from src.routes.health import router as health_router

# ── Logging ──────────────────────────────────────────────────────────────────
logger.remove()
logger.add(
    sys.stderr,
    level=settings.log_level,
    format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan> - <level>{message}</level>",
    colorize=True,
)

# ── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Code Review Service",
    description="Multi-agent AI code review with LangGraph",
    version="1.0.0",
    root_path="/ai",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global error handler ──────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(f"Unhandled error on {request.url}: {exc}")
    return JSONResponse(status_code=500, content={"error": str(exc), "type": type(exc).__name__})

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(health_router)
app.include_router(review_router)
app.include_router(security_router)
app.include_router(documentation_router)
app.include_router(refactor_router)
app.include_router(chat_router)


from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(application: FastAPI):
    logger.info(f"AI Service starting — provider={settings.llm_provider}")
    api_key_set = bool(settings.openai_api_key or settings.anthropic_api_key or settings.google_api_key)
    if not api_key_set and settings.llm_provider != "ollama":
        logger.warning(
            "No API key configured. Set OPENAI_API_KEY (or ANTHROPIC_API_KEY / GOOGLE_API_KEY). "
            "Agents will use fallback responses until a key is added."
        )
    yield
    logger.info("AI Service shutting down")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", settings.port))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True, log_level="info")
