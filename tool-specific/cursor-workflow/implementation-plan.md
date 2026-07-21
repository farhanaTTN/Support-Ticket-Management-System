# Implementation Plan

## Overview

Deliver a full-stack Support Ticket Management System in two phases:

1. **Core** — CRUD, state machine, search/filter, persistence, validation, tests.
2. **Stretch** — JWT auth, role-based authorization, protected routes.
3. **UI/UX** — Responsive card grid, theme toggle, toasts, loading/empty states.

The backend is the source of truth for business rules (especially status transitions).
The frontend mirrors rules for UX but never replaces server enforcement.

## Task Breakdown

| Phase | Task | Key files |
|-------|------|-----------|
| Setup | Scaffold monorepo, `.gitignore`, README, workflow docs | root, `tool-specific/` |
| DB | Prisma schema, migrations, seed users | `backend/prisma/` |
| Domain | Status state machine module | `backend/src/domain/ticketStatus.ts` |
| Services | Ticket + comment + auth services | `backend/src/services/` |
| API | Express routes, Zod validators, error handler, auth middleware | `backend/src/routes/`, `middleware/` |
| Tests | State-machine + auth integration tests | `backend/tests/` |
| Frontend core | API client, auth context, pages, forms | `frontend/src/` |
| Frontend UX | Ticket cards, theme toggle, toasts, spinners | `frontend/src/components/`, `styles.css` |
| Docs | README, submission artifacts, acceptance criteria | `README.md`, `tool-specific/` |

See [tasks.md](tasks.md) for the full ordered checklist with traceability to spec sections.

## Milestones

| Milestone | Deliverable | Status |
|-----------|-------------|--------|
| M1 | Backend API with persistence, validation, state machine | Done |
| M2 | Frontend list/detail/create with search and filter | Done |
| M3 | Integration tests green | Done |
| M4 | JWT auth + role-based authorization | Done |
| M5 | UI/UX improvements (cards, theme, toasts) | Done |
| M6 | Submission documentation complete | Done |

## AI Usage Plan

| Phase | How AI was used |
|-------|-----------------|
| Planning | Generate spec, tasks, and acceptance criteria from requirements |
| Implementation | Scaffold components, CSS, API routes, and service layer |
| Debugging | Investigate login 401 errors; verify API vs UI behaviour |
| Review | Check alignment with state-machine rules and auth policy |
| Documentation | Draft submission templates from existing project context |

Guardrails enforced via `.cursor/rules/support-ticket.mdc`:
- Single state-machine module (no duplicated transition logic)
- Status only via dedicated endpoint
- Zod validation at route boundary
- No secrets in repo
- Mandatory tests must stay green

## Risks

| Risk | Impact |
|------|--------|
| Frontend duplicates backend transition rules incorrectly | Users see actions that fail on submit |
| Client-supplied `createdById` accepted by API | Authorship spoofing |
| Secrets committed to git | Security breach |
| Seed password mismatch causes login failures | Blocks demo/testing |
| UI changes break existing CRUD flows | Regression in core functionality |

## Mitigation

- Keep `ticketStatus.ts` as single source of truth; mirror in `frontend/src/status.ts` only for display
- Derive creator/author from JWT `sub` in all routes
- `.gitignore` excludes `.env` and `*.db`; only `.env.example` tracked
- Document `SEED_PASSWORD` clearly in README and login page hint
- Run `npm test` after behaviour changes; manual smoke test of login → create → status change
