from __future__ import annotations
from enum import Enum
from typing import Any
from pydantic import BaseModel, Field


class LLMProvider(str, Enum):
    openai = "openai"
    anthropic = "anthropic"
    gemini = "gemini"
    ollama = "ollama"


class Severity(str, Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"
    info = "info"


class CodeInput(BaseModel):
    code: str = Field(..., description="Source code to analyze")
    language: str = Field(default="python", description="Programming language")
    filename: str = Field(default="code.py", description="Filename for context")
    context: str = Field(default="", description="Additional context about the code")


class PRInput(BaseModel):
    title: str
    description: str = ""
    files: list[FileInput] = Field(default_factory=list)
    repository: str = ""
    author: str = ""


class FileInput(BaseModel):
    path: str
    content: str
    additions: int = 0
    deletions: int = 0


class CodeIssue(BaseModel):
    line: int | None = None
    column: int | None = None
    severity: Severity
    category: str
    title: str
    description: str
    suggestion: str
    code_snippet: str = ""
    fixed_code: str = ""
    confidence: float = Field(ge=0.0, le=1.0, default=0.8)


class ReviewerResult(BaseModel):
    score: int = Field(ge=0, le=100)
    issues: list[CodeIssue]
    summary: str
    strengths: list[str]
    improvements: list[str]


class SecurityResult(BaseModel):
    score: int = Field(ge=0, le=100)
    issues: list[CodeIssue]
    owasp_categories: list[str]
    summary: str
    risk_level: Severity


class ComplexityResult(BaseModel):
    score: int = Field(ge=0, le=100)
    cyclomatic_complexity: int
    cognitive_complexity: int
    max_nesting_depth: int
    long_functions: list[str]
    issues: list[CodeIssue]
    summary: str


class DocumentationResult(BaseModel):
    score: int = Field(ge=0, le=100)
    missing_docs: list[str]
    generated_readme: str
    function_docs: dict[str, str]
    summary: str


class RefactoringResult(BaseModel):
    score: int = Field(ge=0, le=100)
    suggestions: list[RefactoringSuggestion]
    design_patterns: list[str]
    duplication_score: int = Field(ge=0, le=100)
    summary: str


class RefactoringSuggestion(BaseModel):
    title: str
    description: str
    before: str
    after: str
    impact: str
    effort: str = Field(description="low|medium|high")


class FullReviewResult(BaseModel):
    overall_score: int = Field(ge=0, le=100)
    quality_score: int = Field(ge=0, le=100)
    security_score: int = Field(ge=0, le=100)
    complexity_score: int = Field(ge=0, le=100)
    documentation_score: int = Field(ge=0, le=100)
    refactoring_score: int = Field(ge=0, le=100)
    reviewer: ReviewerResult
    security: SecurityResult
    complexity: ComplexityResult
    documentation: DocumentationResult
    refactoring: RefactoringResult
    ai_summary: str
    top_issues: list[str]
    review_time_ms: int
    cached: bool = False


class ChatMessage(BaseModel):
    role: str = Field(description="user|assistant|system")
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = Field(default_factory=list)
    code_context: str = ""
    repository: str = ""


class AgentState(BaseModel):
    code: str
    language: str
    filename: str
    context: str
    reviewer: ReviewerResult | None = None
    security: SecurityResult | None = None
    complexity: ComplexityResult | None = None
    documentation: DocumentationResult | None = None
    refactoring: RefactoringResult | None = None
    errors: list[str] = Field(default_factory=list)
