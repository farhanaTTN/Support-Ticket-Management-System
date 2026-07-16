# Support Ticket Management System

A small internal application for creating, updating, commenting on, searching, and
progressing support tickets through an enforced lifecycle (state machine).

## Stack

- Backend: Node + Express + TypeScript
- Persistence: Prisma ORM + SQLite (file-based, survives restart)
- Frontend: React + Vite + TypeScript
- Validation: Zod (backend request validation)
- Tests: Vitest + Supertest (state-machine integration tests)

## Project structure

```
backend/    Express + Prisma API
frontend/   React + Vite UI
tool-specific/cursor-workflow/   Project context, spec, tasks, acceptance criteria, rules
```

## Prerequisites

- Node.js >= 18 (tested on Node 22)
- npm >= 9

## Getting started

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env          # Windows: copy .env.example .env
npm run db:migrate            # create SQLite schema
npm run db:seed               # seed users
npm run dev                   # start API on http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                   # start UI on http://localhost:5173
```

The frontend proxies `/api` requests to the backend at `http://localhost:4000`.

## Running tests

```bash
cd backend
npm test                      # runs state-machine integration tests
```

## Ticket status state machine

```
OPEN         -> IN_PROGRESS, CANCELLED
IN_PROGRESS  -> RESOLVED, CANCELLED
RESOLVED     -> CLOSED
CLOSED       -> (terminal)
CANCELLED    -> (terminal)
```

Status can only change through the dedicated endpoint `POST /api/tickets/:id/status`.
Invalid transitions are rejected by the backend with HTTP 400 and surfaced clearly in the UI.

## API overview

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users` | List seeded users |
| POST | `/api/tickets` | Create a ticket |
| GET | `/api/tickets?q=&status=` | List tickets with keyword search and status filter |
| GET | `/api/tickets/:id` | Ticket detail with comments |
| PATCH | `/api/tickets/:id` | Update title, description, priority, assignee |
| POST | `/api/tickets/:id/status` | Change status (state-machine enforced) |
| POST | `/api/tickets/:id/comments` | Add a comment |

## Security notes

- No secrets are committed. Only `.env.example` is tracked; `.env` and `*.db` are git-ignored.
- All input is validated at the backend; invalid transitions fail closed on the server.
