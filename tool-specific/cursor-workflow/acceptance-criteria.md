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

## How to verify quickly

1. Backend: `npm install`, `npm run db:migrate`, `npm run db:seed`, `npm run dev`.
2. Frontend: `npm install`, `npm run dev`, open http://localhost:5173.
3. Tests: `cd backend && npm test`.
