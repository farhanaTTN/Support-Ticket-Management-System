# Project Context

## Product

Support Ticket Management System: a small internal application for managing
support tickets. Internal users create, update, comment on, search, and
progress tickets through a defined lifecycle.

## Users and roles

Users are seeded only (no user-management UI in Core). Roles: `ADMIN`,
`AGENT`, `REQUESTER`. Because there is no authentication in Core, the UI
provides an "Acting as" selector backed by the seeded users so that
`createdBy` / comment authorship can be attributed.

## Entities

- User: id, name, email, role
- Ticket: id, title, description, priority, status, assignedTo, createdBy,
  createdAt, updatedAt
- Comment: id, ticketId, message, createdBy, createdAt

## Constraints and non-functional requirements

- Persist all data; data survives restart (SQLite file database).
- Validate required fields; reject invalid input at the backend.
- Show meaningful error states in the UI.
- No secrets committed to the repo.
- The ticket status lifecycle is enforced by a backend state machine.

## Stack decisions

- Backend: Node + Express + TypeScript
- ORM/DB: Prisma + SQLite
- Frontend: React + Vite + TypeScript
- Validation: Zod
- Tests: Vitest + Supertest (state-machine integration tests)

## Out of scope (Core)

Authentication, user CRUD, role-based authorization, priority/assignee
filtering, sorting, pagination, API docs, Docker, and CI are Stretch items
and intentionally excluded from this implementation.
