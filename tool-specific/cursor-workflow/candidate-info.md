# Candidate Information

Name: Farhana Khatoon
Role: JS (Fullstack) Software Engineer
Primary Technology Stack: React, TypeScript, Node.js, Express, Prisma, SQLite

Primary AI Tool Used: Cursor  
Project Option Selected: Support Ticket Management System

Assessment Start Date: 16-07-2026

Submission Date: 21-07-2026

## Project Summary

Built a full-stack Support Ticket Management System for internal support teams.
The application lets authenticated users create, search, filter, view, update,
comment on, and delete tickets, while agents and admins can reassign tickets and
progress them through a backend-enforced status state machine. The frontend
includes a responsive ticket card grid, light/dark theme toggle, toast
notifications, loading/empty states, and role-aware UI.

Stretch goals implemented: JWT authentication, bcrypt password hashing, protected
API routes, and role-based authorization (AGENT/ADMIN for updates and status
changes).

## Tools Used

| Category      | Tools                                                               |
| ------------- | ------------------------------------------------------------------- |
| IDE / AI      | Cursor, Cursor rules (`.cursor/rules/support-ticket.mdc`)           |
| Frontend      | React 18, Vite, TypeScript, React Router                            |
| Backend       | Node.js, Express, TypeScript                                        |
| Database      | Prisma ORM, SQLite                                                  |
| Validation    | Zod (backend route boundary)                                        |
| Auth          | JWT (`jsonwebtoken`), bcrypt (`bcryptjs`)                           |
| Testing       | Vitest, Supertest                                                   |
| Workflow docs | `tool-specific/cursor-workflow/` (spec, tasks, acceptance criteria) |

## Setup Summary

1. **Backend**

```bash
 cd backend
 npm install
 cp .env.example .env
 npm run db:migrate
 npm run db:seed
 npm run dev
```

API runs at `http://localhost:4000`. 2. **Frontend**

```bash
 cd frontend
 npm install
 npm run dev
```

UI runs at `http://localhost:5173` (proxies `/api` to backend). 3. **Tests**

```bash
 cd backend
 npm test
```

1. **Demo login**

- Email: `bob.agent@example.com` (AGENT) or `dave.requester@example.com` (REQUESTER)
- Password: `Password123!` (from `SEED_PASSWORD` in `.env`)
