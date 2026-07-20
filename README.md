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

## Authentication and authorization

Authentication uses JWT bearer tokens. Log in with a seeded account to obtain a
token; the frontend stores it and sends it as `Authorization: Bearer <token>`.

- Seeded demo accounts (all share the `SEED_PASSWORD`, default `Password123!`):
  - `alice.admin@example.com` (ADMIN)
  - `bob.agent@example.com`, `carol.agent@example.com` (AGENT)
  - `dave.requester@example.com`, `erin.requester@example.com` (REQUESTER)
- Role permissions:
  - Any authenticated user: view tickets/users, create tickets, add comments.
  - AGENT or ADMIN only: update/reassign tickets and change status.
- The ticket creator and comment author are derived from the authenticated
  token on the server; clients cannot spoof them.

## API overview

Auth: `Authorization: Bearer <token>` is required except for `POST /api/auth/login`
and `GET /api/health`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | Public | Exchange email/password for a JWT |
| GET | `/api/auth/me` | Authenticated | Current user profile |
| GET | `/api/users` | Authenticated | List seeded users |
| POST | `/api/tickets` | Authenticated | Create a ticket (creator = current user) |
| GET | `/api/tickets?q=&status=` | Authenticated | List with keyword search and status filter |
| GET | `/api/tickets/:id` | Authenticated | Ticket detail with comments |
| PATCH | `/api/tickets/:id` | AGENT/ADMIN | Update title, description, priority, assignee |
| POST | `/api/tickets/:id/status` | AGENT/ADMIN | Change status (state-machine enforced) |
| POST | `/api/tickets/:id/comments` | Authenticated | Add a comment (author = current user) |

## Security notes

- No secrets are committed. Only `.env.example` is tracked; `.env` and `*.db` are git-ignored.
- Passwords are hashed with bcrypt; JWTs are signed with `JWT_SECRET` from the environment.
- All input is validated at the backend; invalid transitions fail closed on the server.
- Protected routes reject missing/invalid tokens (401) and insufficient roles (403).
