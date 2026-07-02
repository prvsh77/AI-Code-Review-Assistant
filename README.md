<div align="center">
<img src="docs/Banner%20(2).png" width="100%">
  AI Code Review Assistant

### AI-Powered Multi-Agent Platform for Intelligent Pull Request Reviews

<p align="center">
Analyze pull requests using Large Language Models, detect security vulnerabilities, evaluate code quality, generate documentation insights, and produce actionable review reports through an AI-powered multi-agent workflow.
</p>

<p align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript)
![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai)

</p>

<img src="./docs/banner.png" width="100%"/>

</div>

---

#  Overview

AI Code Review Assistant is a full-stack AI platform that automates pull request reviews using Large Language Models and a multi-agent architecture.

The application combines GitHub integration, AI-powered code analysis, security scanning, documentation review, and interactive analytics into a unified developer experience.

---

#  Features

## AI Code Review

- AI-powered pull request analysis
- Multi-agent review workflow
- Code quality evaluation
- Security assessment
- Documentation analysis
- Actionable review reports
- AI-generated review summaries

---

##  Security Analysis

- SQL Injection Detection
- XSS Detection
- Secret Detection
- Authentication Review
- Dependency Risk Analysis
- Security Scoring

---

##  Analytics Dashboard

- Repository Statistics
- Review History
- Language Distribution
- Quality Trends
- Review Metrics
- Interactive Charts

---

##  GitHub Integration

- GitHub OAuth
- Repository Synchronization
- Pull Request Import
- Repository Dashboard
- Trigger AI Reviews
- Graceful onboarding for users without connected GitHub accounts

---

##  Authentication

- Email Registration
- Secure Login
- JWT Authentication
- Protected Routes
- Session Persistence

---

##  AI Assistant

- Streaming Responses
- Context-aware Conversations
- Review Explanations
- AI Suggestions
- Multi-agent Reasoning

---

#  System Architecture

```
                 GitHub API
                      │
      OAuth • Repositories • Pull Requests
                      │
                      ▼
              Express API Server
        Authentication • REST API • JWT
                      │
      ┌───────────────┴───────────────┐
      ▼                               ▼
PostgreSQL Database          FastAPI AI Service
                                   │
                                   ▼
                      Multi-Agent Review Engine
                    ┌─────────────────────────┐
                    │ Security Agent          │
                    │ Code Quality Agent      │
                    │ Documentation Agent     │
                    │ Performance Agent       │
                    └─────────────────────────┘
                                   │
                                   ▼
                           OpenAI / Ollama
                                   │
                                   ▼
                         AI Review Report
                                   │
                                   ▼
                         React Frontend
```

---

#  Tech Stack

## Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- React Router
- Recharts
- Framer Motion

---

## Backend

- Express.js
- TypeScript
- JWT Authentication
- GitHub OAuth
- Drizzle ORM

---

## AI Service

- FastAPI
- Python
- OpenAI
- LangGraph
- Multi-Agent Architecture
- Streaming Responses

---

## Database

- PostgreSQL
- Drizzle ORM

---

## Testing

- Vitest
- Pytest

---

# 📸 Screenshots

| Landing | Dashboard |
|---------|-----------|
| ![](./docs/screenshots/landing.png) | ![](./docs/screenshots/dashboard.png) |

| Repositories | AI Review |
|--------------|-----------|
| ![](./docs/screenshots/repositories.png) | ![](./docs/screenshots/review.png) |

| Security | Analytics |
|----------|-----------|
| ![](./docs/screenshots/security.png) | ![](./docs/screenshots/analytics.png) |

---

#  Project Structure

```text
AI-Code-Review-Assistant
│
├── artifacts
│   ├── ai-code-review        # React Frontend
│   ├── api-server            # Express Backend
│   └── ai-service            # FastAPI AI Service
│
├── lib
│   ├── db
│   ├── api-client-react
│   ├── api-zod
│   └── api-spec
│
└── docs
    ├── banner.png
    └── screenshots
```

---

# ⚙️ Installation

```bash
git clone https://github.com/prvsh77/AI-Code-Review-Assistant.git

cd AI-Code-Review-Assistant

pnpm install
```

---

#  Environment Variables

Create the following files:

```
artifacts/api-server/.env

artifacts/ai-service/.env

lib/db/.env
```

Example:

```env
DATABASE_URL=
JWT_SECRET=
OPENAI_API_KEY=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

---

# ▶ Running Locally

### Backend

```bash
cd artifacts/api-server

pnpm build

pnpm start
```

### AI Service

```bash
cd artifacts/ai-service

python -m venv .venv

.\.venv\Scripts\activate

pip install -r requirements.txt

python main.py
```

### Frontend

```bash
cd artifacts/ai-code-review

pnpm dev
```

---

# 🧪 Testing

Backend

```bash
pnpm test
```

Frontend

```bash
pnpm build

pnpm typecheck
```

AI Service

```bash
pytest
```

---

#  Roadmap

### Completed

- ✅ JWT Authentication
- ✅ GitHub OAuth
- ✅ Repository Integration
- ✅ Pull Request Reviews
- ✅ AI Multi-Agent Workflow
- ✅ Security Analysis
- ✅ Analytics Dashboard
- ✅ AI Streaming
- ✅ PostgreSQL Integration
- ✅ Automated Testing

### Future Enhancements

- GitHub Webhooks
- Team Workspaces
- Slack Notifications
- GitLab Integration
- Azure DevOps Integration
- AI Cost Dashboard
- Organization Analytics
- Review Comparison

---

#  License

MIT License

---

<div align="center">

### ⭐ If you found this project useful, consider giving it a star!

Built with ❤️ using React, FastAPI, PostgreSQL, TypeScript, and Large Language Models.

</div>
