# Acceptance Criteria

## Core

- [x] User can create a ticket via the UI (`TicketForm` → `POST /api/tickets`)
- [x] User can view all tickets from the database in a responsive card grid
- [x] User can open a ticket detail view with comments (`GET /api/tickets/:id`)
- [x] AGENT/ADMIN can update ticket fields and reassign (`PATCH /api/tickets/:id`)
- [x] AGENT/ADMIN can delete a ticket (`DELETE /api/tickets/:id`)
- [x] Any authenticated user can add comments (`POST /api/tickets/:id/comments`)
- [x] Status changes only through `POST /api/tickets/:id/status` with valid transitions
- [x] Invalid status transitions are rejected with HTTP 400
- [x] Keyword search and status filter work on the tickets list
- [x] Data persists after server restart (SQLite via Prisma)
- [x] Ticket cards show ID, title, description (truncated), status badge, priority badge, assignee, creation date, and action buttons
- [x] Attractive empty state when no tickets exist
- [x] Light/dark theme toggle in the navigation bar, persisted in `localStorage`

## Validation

- [x] Backend validates all request input with Zod at the route boundary
- [x] Title and description are required and length-limited
- [x] Priority must be one of `LOW | MEDIUM | HIGH | CRITICAL`
- [x] `assignedToId` must reference an existing user
- [x] Ticket creator and comment author are derived from JWT `sub`, not request body
- [x] Frontend forms show inline validation messages before submit
- [x] Login form validates email format and required fields

## Error Handling

- [x] API errors use consistent shape `{ error, details? }`
- [x] `ErrorBanner` displays backend error messages in the UI
- [x] Toast notifications for success and failure actions
- [x] 401 on any authenticated call clears session and redirects to login
- [x] 403 surfaces permission errors clearly
- [x] 404 shows ticket-not-found state on detail page
- [x] Network errors show user-friendly message ("could not reach the server")
- [x] State-machine rejections surface the backend message in the UI

## Testing

- [x] State-machine integration tests pass (`ticketStatus.integration.test.ts`)
- [x] Auth/authorization integration tests pass (`auth.integration.test.ts`)
- [x] Tests cover valid transitions, invalid transitions, self-transition rejection, and role checks
- [x] `npm test` in `backend/` runs green

## Documentation

- [x] README includes setup, seed accounts, API overview, and security notes
- [x] `.env.example` documents required environment variables (no real secrets)
- [x] `tool-specific/cursor-workflow/` contains spec, tasks, and workflow rules
- [x] Submission artifacts follow the required template structure

## Stretch: Authentication & Authorization

- [x] Users authenticate with email + bcrypt-hashed password (`POST /api/auth/login`)
- [x] JWT issued on successful login; stored in frontend `localStorage`
- [x] All routes except login and health require valid JWT
- [x] `PATCH /tickets/:id` and `POST /tickets/:id/status` require AGENT or ADMIN role
- [x] Frontend protected routes redirect unauthenticated users to `/login`
- [x] Role-gated UI: managers see edit/delete/status controls; requesters do not
