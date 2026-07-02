<div align="center">

# 🤖 AI Code Review Assistant

### Multi-Agent AI Platform for Intelligent Pull Request Reviews

<p align="center">
AI-powered code review platform that analyzes pull requests, detects bugs, identifies security vulnerabilities, evaluates code quality, and generates actionable review reports using Large Language Models.
</p>

<p align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript)

</p>

---

<img src="./docs/banner.png" width="100%" />

</div>

---

# ✨ Features

### 🤖 AI Code Reviews

- Automated pull request analysis
- Multi-agent review workflow
- Code quality evaluation
- Architecture feedback
- Documentation analysis

---

### 🔒 Security Analysis

- SQL Injection Detection
- XSS Detection
- Secrets Detection
- Authentication Review
- Dependency Risk Analysis
- Security Score

---

### 📊 Analytics Dashboard

- Repository Insights
- Review History
- Language Distribution
- Code Quality Trends
- Security Metrics
- Team Statistics

---

### 🔗 GitHub Integration

- GitHub OAuth Login
- Repository Sync
- Pull Request Import
- Repository Dashboard
- Trigger Reviews
- Review Status Tracking

---

### 👥 Authentication

- User Registration
- Secure Login
- JWT Authentication
- Protected Routes
- Session Management

---

### 💬 AI Assistant

- Streaming Responses
- Context-Aware Conversations
- Pull Request Discussion
- Review Explanation
- Code Suggestions

---

# 🏗 Architecture

```
                     GitHub API
                          │
                          │
                Repository / PR Data
                          │
                          ▼

              FastAPI / Express Backend
        Authentication • REST APIs • Database

              │                    │
              │                    │

              ▼                    ▼

      PostgreSQL Database     AI Service

                                   │
                                   ▼

                      Multi-Agent Review Engine

             Security Agent
             Code Quality Agent
             Performance Agent
             Documentation Agent

                                   │

                                   ▼

                          OpenAI / LLM

                                   │

                                   ▼

                        Final Review Report

                                   │

                                   ▼

                          React Frontend
```

---

# 🚀 Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Query
- React Router
- Recharts

---

## Backend

- FastAPI
- Express.js
- Node.js
- JWT Authentication

---

## AI

- OpenAI
- Multi-Agent Architecture
- Prompt Engineering
- Streaming Responses

---

## Database

- PostgreSQL
- Drizzle ORM

---

## DevOps

- Docker
- GitHub Actions
- Vitest
- Pytest

---

# 📷 Screenshots

## Landing Page

<img src="./docs/screenshots/landing.png"/>

---

## Dashboard

<img src="./docs/screenshots/dashboard.png"/>

---

## Repository Analysis

<img src="./docs/screenshots/repositories.png"/>

---

## AI Review

<img src="./docs/screenshots/review.png"/>

---

## Security Dashboard

<img src="./docs/screenshots/security.png"/>

---

# 📂 Project Structure

```
AI-Code-Review-Assistant

artifacts/
│
├── ai-code-review/      # React Frontend
├── api-server/          # Express Backend
├── ai-service/          # FastAPI AI Service
│
lib/
│
├── db/
├── api-client-react/
├── api-zod/
└── api-spec/
```

---

# ⚙ Installation

```bash
git clone https://github.com/prvsh77/AI-Code-Review-Assistant.git

cd AI-Code-Review-Assistant

pnpm install
```

---

## Configure Environment

Create:

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

# ▶ Run

Backend

```bash
pnpm --filter api-server start
```

Frontend

```bash
pnpm --filter ai-code-review dev
```

AI Service

```bash
python main.py
```

---

# 🧪 Testing

Backend

```bash
pnpm test
```

Python

```bash
pytest
```

---

# 🛣 Roadmap

- [x] Authentication
- [x] JWT
- [x] GitHub OAuth
- [x] GitHub Repository Integration
- [x] AI Review Engine
- [x] Security Analysis
- [x] Dashboard
- [x] Analytics
- [x] AI Streaming
- [x] PostgreSQL
- [x] Testing

Upcoming

- [ ] GitHub Webhooks
- [ ] Team Collaboration
- [ ] Slack Notifications
- [ ] Azure DevOps Support
- [ ] GitLab Support
- [ ] Review Comparison
- [ ] AI Cost Dashboard

---

# 📄 License

MIT License

---

<div align="center">

### ⭐ If you found this project useful, consider giving it a star!

Built with ❤️ using React, FastAPI, PostgreSQL, and Large Language Models.

</div>
