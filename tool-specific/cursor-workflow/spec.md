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

## 4. Authentication and authorization (Stretch, implemented)

- Auth model: JWT bearer tokens. `POST /api/auth/login` verifies email + bcrypt
  password hash and returns `{ token, user }`.
- All routes except `POST /api/auth/login` and `GET /api/health` require a valid
  `Authorization: Bearer <token>` header (401 otherwise; 401 on invalid/expired).
- Role policy:
  - Any authenticated user: view tickets/users, create tickets, add comments.
  - AGENT or ADMIN only: `PATCH /tickets/:id` and `POST /tickets/:id/status`
    (403 for other roles).
- Trust boundary: `createdById` (ticket creator) and comment author are derived
  from the token `sub`, never accepted from the request body.
- Secrets: `JWT_SECRET` comes from the environment; passwords are bcrypt-hashed.
  The single source of truth for the manager-role set is the backend; the
  frontend mirrors it in `frontend/src/types.ts` (`MANAGER_ROLES`) for UI gating.

## 5. API contract

Base URL: `/api`. Error responses use the shape `{ error, details? }`.

| Method | Path | Auth | Body | Success | Errors |
|--------|------|------|------|---------|--------|
| POST | `/auth/login` | Public | email, password | 200 { token, user } | 400 validation, 401 bad credentials |
| GET | `/auth/me` | Authenticated | - | 200 User | 401 |
| GET | `/users` | Authenticated | - | 200 User[] | 401 |
| POST | `/tickets` | Authenticated | title, description, priority, assignedToId? | 201 Ticket | 400 validation, 401 |
| GET | `/tickets?q=&status=` | Authenticated | - | 200 Ticket[] | 400 invalid status filter, 401 |
| GET | `/tickets/:id` | Authenticated | - | 200 Ticket + comments + allowedNextStatuses | 401, 404 not found |
| PATCH | `/tickets/:id` | AGENT/ADMIN | title?, description?, priority?, assignedToId? | 200 Ticket | 400 validation, 401, 403, 404 |
| POST | `/tickets/:id/status` | AGENT/ADMIN | status | 200 Ticket | 400 invalid transition, 401, 403, 404 |
| POST | `/tickets/:id/comments` | Authenticated | message | 201 Comment | 400 validation, 401, 404 |

## 6. Validation rules

- title: non-empty, <= 200 chars.
- description: non-empty, <= 5000 chars.
- priority: one of the allowed priorities.
- message: non-empty, <= 5000 chars.
- assignedToId: must reference an existing user; creator/author derived from token.
- status (transition): must be a valid enum value AND a permitted transition.
- login: email must be a valid email; password non-empty.

## 7. Persistence

SQLite file database via Prisma. `DATABASE_URL=file:./dev.db`. Data survives
process restart. Tests use an isolated `file:./test.db`.

## 8. Error handling (frontend)

A shared `ErrorBanner` shows backend error messages for validation failures,
401/403 authorization errors, 404s, network errors, and rejected status
transitions. A 401 on any authenticated call clears the session and redirects
to the login page.
