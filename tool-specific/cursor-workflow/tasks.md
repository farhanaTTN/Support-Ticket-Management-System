# Tasks

Ordered implementation checklist. Each task references the spec section
([spec.md](spec.md)) it satisfies, giving traceability from spec to code.

- [x] T1. Scaffold monorepo (backend + frontend), .gitignore, README, and
  cursor-workflow docs. (Setup)
- [x] T2. Prisma schema for User/Ticket/Comment + SQLite config + seed users.
  (spec 2, 6) -> `backend/prisma/schema.prisma`, `backend/prisma/seed.ts`
- [x] T3. State-machine module with allowed transitions + canTransition.
  (spec 3) -> `backend/src/domain/ticketStatus.ts`
- [x] T4. Ticket + comment services (create, list+search+filter, get, update
  fields, transition status, add comment). (FR1-FR7) ->
  `backend/src/services/*.ts`
- [x] T5. Express routes with Zod validation + central error handler.
  (spec 4, 5, 7) -> `backend/src/routes/*.ts`, `backend/src/middleware/*.ts`
- [x] T6. Mandatory state-machine integration tests (valid pass, invalid
  rejected). (spec 3) -> `backend/tests/ticketStatus.integration.test.ts`
- [x] T7. Tickets page: list + keyword search + status filter + create form.
  (FR1, FR2, FR7) -> `frontend/src/pages/TicketsPage.tsx`
- [x] T8. Detail page: edit fields/reassign, comment thread, status actions
  limited to valid transitions. (FR3, FR4, FR5, FR6) ->
  `frontend/src/pages/TicketDetailPage.tsx`
- [x] T9. ErrorBanner + wire error states for 400/404/network + rejected
  transitions. (FR10, spec 7) -> `frontend/src/components/ErrorBanner.tsx`
- [x] T10. Finalize README (run/seed/test), .env.example, and update
  acceptance-criteria for traceability. (Docs)

## Iteration log

- v1: Initial scaffold and full Core implementation across backend + frontend.
- v1.1: Added `allowedNextStatuses` to the ticket detail response so the UI and
  backend rules stay aligned; added an explicit self-transition rejection
  (already-in-status) and unknown-status test case beyond the base matrix.
