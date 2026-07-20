# Acceptance Criteria

Each Core acceptance criterion is mapped to how it is satisfied and verified.

| # | Criterion | Implementation | Verification |
|---|-----------|----------------|--------------|
| AC1 | Create a ticket via the UI | `frontend/src/components/TicketForm.tsx` + `POST /api/tickets` | Create form on Tickets page; new ticket appears in list |
| AC2 | View all tickets from the database | `frontend/src/pages/TicketsPage.tsx` + `GET /api/tickets` | Table lists persisted tickets |
| AC3 | Open a ticket detail view | `frontend/src/pages/TicketDetailPage.tsx` + `GET /api/tickets/:id` | Clicking a title opens detail with comments |
| AC4 | Update ticket fields and reassign | `updateTicket` + `PATCH /api/tickets/:id` | Edit details card saves title/description/priority/assignee |
| AC5 | Add comments | `commentService.addComment` + `POST /api/tickets/:id/comments` | Comment appears in the thread |
| AC6 | Status changes only through valid transitions; invalid rejected | `backend/src/domain/ticketStatus.ts` + `POST /api/tickets/:id/status` | UI shows only valid actions; backend returns 400 for invalid |
| AC7 | Keyword search and status filter work | `listTickets` where-clause + Tickets page controls | Search box + status dropdown filter results |
| AC8 | Data remains available after restart | Prisma + SQLite `file:./dev.db` | Restart API; tickets/comments persist |
| AC9 | Backend validation prevents invalid records | Zod schemas + service existence checks | Missing/invalid fields return 400 |
| AC10 | No secrets committed | `.gitignore` excludes `.env`, `*.db`; only `.env.example` tracked | Repo contains no secrets |
| AC11 | State-machine integration tests pass | `backend/tests/ticketStatus.integration.test.ts` | `npm test` in backend is green |

## Stretch: authentication and authorization (implemented)

| # | Criterion | Implementation | Verification |
|---|-----------|----------------|--------------|
| S1 | Users authenticate with credentials | `POST /api/auth/login` + bcrypt in `authService.ts` | Login returns a JWT; wrong password returns 401 |
| S2 | Protected routes reject unauthenticated access | `requireAuth` middleware in `backend/src/middleware/auth.ts` | Calls without a token return 401 |
| S3 | API authorization checks by role | `requireRole("AGENT","ADMIN")` on PATCH and status routes | REQUESTER gets 403; AGENT succeeds |
| S4 | Frontend protected routes + session | `RequireAuth`, `authContext`, `LoginPage` | Unauthenticated users are redirected to `/login` |
| S5 | Creator/author cannot be spoofed | Derived from token `sub` in routes/services | Comment author equals the token user in tests |
| S6 | Auth/authorization tests pass | `backend/tests/auth.integration.test.ts` | `npm test` green (10 auth tests) |

## How to verify quickly

1. Backend: `npm install`, `npm run db:migrate`, `npm run db:seed`, `npm run dev`.
2. Frontend: `npm install`, `npm run dev`, open http://localhost:5173.
3. Tests: `cd backend && npm test`.
