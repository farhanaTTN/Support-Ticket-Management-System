# Project Context

## Product

Support Ticket Management System: a small internal application for managing
support tickets. Internal users create, update, comment on, search, and
progress tickets through a defined lifecycle.

## Users and roles

Users are seeded only (no user-management UI). Roles: `ADMIN`, `AGENT`,
`REQUESTER`. Authentication has been added (see the Stretch note below): users
log in with a seeded account, and `createdBy` / comment authorship is derived
from the authenticated user rather than a client-supplied id.

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

## Stretch implemented

Authentication (JWT + bcrypt), protected routes, and role-based API
authorization have been added on top of Core. See `spec.md` sections 4-5.

## Out of scope

User CRUD/management UI, priority/assignee filtering, sorting, pagination,
API docs, Docker, and CI remain out of scope.
