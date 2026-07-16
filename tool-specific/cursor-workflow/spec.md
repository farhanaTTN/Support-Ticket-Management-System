# Specification

## 1. Functional requirements

- FR1: Create a ticket.
- FR2: List tickets.
- FR3: View ticket details (including comments).
- FR4: Update ticket fields (title, description, priority, assignee).
- FR5: Change ticket status through the enforced state machine.
- FR6: Add comments to a ticket.
- FR7: Keyword search and filter by status.
- FR8: Persist all data; survives restart.
- FR9: Validate required fields; reject invalid input at the backend.
- FR10: Show meaningful error states in the UI.

## 2. Data model

See [project-context.md](project-context.md). Priority is one of
`LOW | MEDIUM | HIGH | CRITICAL`. Status is one of
`OPEN | IN_PROGRESS | RESOLVED | CLOSED | CANCELLED`. SQLite has no native
enums, so these are stored as strings and validated in application code.

## 3. Status state machine (the signature piece)

```
OPEN         -> IN_PROGRESS, CANCELLED
IN_PROGRESS  -> RESOLVED, CANCELLED
RESOLVED     -> CLOSED
CLOSED       -> (terminal)
CANCELLED    -> (terminal)
```

Rules:

- Status changes happen ONLY via `POST /api/tickets/:id/status`. The generic
  update endpoint cannot modify status.
- Invalid transitions are rejected by the backend with HTTP 400 and a message
  of the form `Cannot transition from <FROM> to <TO>`.
- The single source of truth is `backend/src/domain/ticketStatus.ts`. The
  frontend mirrors these rules in `frontend/src/status.ts` to render only valid
  actions, but the backend remains authoritative.

## 4. API contract

Base URL: `/api`. Error responses use the shape `{ error, details? }`.

| Method | Path | Body | Success | Errors |
|--------|------|------|---------|--------|
| GET | `/users` | - | 200 User[] | - |
| POST | `/tickets` | title, description, priority, createdById, assignedToId? | 201 Ticket | 400 validation, 400 unknown user |
| GET | `/tickets?q=&status=` | - | 200 Ticket[] | 400 invalid status filter |
| GET | `/tickets/:id` | - | 200 Ticket + comments + allowedNextStatuses | 404 not found |
| PATCH | `/tickets/:id` | title?, description?, priority?, assignedToId? | 200 Ticket | 400 validation, 404 not found |
| POST | `/tickets/:id/status` | status | 200 Ticket | 400 invalid transition, 404 not found |
| POST | `/tickets/:id/comments` | message, createdById | 201 Comment | 400 validation, 404 not found |

## 5. Validation rules

- title: non-empty, <= 200 chars.
- description: non-empty, <= 5000 chars.
- priority: one of the allowed priorities.
- message: non-empty, <= 5000 chars.
- createdById / assignedToId: must reference an existing user.
- status (transition): must be a valid enum value AND a permitted transition.

## 6. Persistence

SQLite file database via Prisma. `DATABASE_URL=file:./dev.db`. Data survives
process restart. Tests use an isolated `file:./test.db`.

## 7. Error handling (frontend)

A shared `ErrorBanner` shows backend error messages for validation failures,
404s, network errors, and rejected status transitions.
