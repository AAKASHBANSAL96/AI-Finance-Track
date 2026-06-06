# Personal Finance AI Copilot

A privacy-first, local-first personal finance analytics platform built with MERN, local LLMs, and RAG.

## Features

- User registration and JWT authentication
- Secure bank statement PDF upload
- Digital and scanned PDF transaction extraction
- Sensitive data masking for account numbers, cards, UPI, and phone numbers
- Expense categorization with merchant dictionary + local LLM assistance
- Transaction storage and monthly analytics
- AI-powered financial assistant with RAG over local knowledge base
- Local inference via Ollama and Qwen3 / nomic-embed-text
- Docker compose for backend, frontend, MongoDB, and Qdrant

## Folder structure

- `backend/` - Express API, AI pipelines, PDF parsing, RAG services
- `frontend/` - React + TypeScript dashboard, auth, upload, chat UI

## Local setup

1. Install Docker Desktop and Docker Compose
2. Install Node.js 20+ and npm
3. Install Ollama locally and pull models:

```bash
ollama pull qwen3:8b
ollama pull nomic-embed-text
```

4. Copy environment variables:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

5. Start local services:

```bash
docker compose up -d
```

6. Install dependencies:

```bash
cd backend && npm install
cd ../frontend && npm install
```

7. Run development servers:

```bash
cd backend && npm run dev
cd ../frontend && npm run dev
```

## API docs

Backend Swagger docs available at `/api/docs` after startup.
