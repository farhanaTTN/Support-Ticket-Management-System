# Requirement Analysis

## Selected Project Option

Support Ticket Management System — a small internal application for managing
support tickets through a defined lifecycle.

## My Understanding

Internal users need a reliable way to log support issues, track progress, leave
comments, and move tickets through valid workflow states. The system must persist
data across restarts, validate input on the server, and prevent invalid status
jumps. Agents and admins need elevated permissions to edit tickets and change
status; requesters can create tickets and comment but cannot manage workflow.

The UI should feel modern and responsive: ticket cards in a grid, clear badges
for status/priority, helpful loading and empty states, and a theme toggle for
light/dark mode.

## Functional Requirements

| ID | Requirement |
|----|-------------|
| FR1 | Create a ticket (title, description, priority, optional assignee) |
| FR2 | List all tickets from persistent storage |
| FR3 | View ticket detail including comments |
| FR4 | Update ticket fields (title, description, priority, assignee) — AGENT/ADMIN |
| FR5 | Change ticket status only through valid transitions — AGENT/ADMIN |
| FR6 | Add comments to a ticket |
| FR7 | Search tickets by keyword and filter by status |
| FR8 | Delete a ticket — AGENT/ADMIN |
| FR9 | Authenticate users with email/password (JWT) |
| FR10 | Enforce role-based access on protected operations |
| FR11 | Toggle light/dark theme with persistence in `localStorage` |
| FR12 | Display tickets in a responsive card grid with actions (View, Edit, Delete) |

## Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR1 | Data persists across application restart (SQLite file DB) |
| NFR2 | Backend validates all input; invalid data rejected with HTTP 400 |
| NFR3 | Consistent error shape: `{ error, details? }` |
| NFR4 | No secrets committed to the repository |
| NFR5 | Responsive UI for desktop, tablet, and mobile |
| NFR6 | Meaningful loading, empty, and error states in the UI |
| NFR7 | Maintainable structure with reusable components |
| NFR8 | At least one meaningful automated test suite |

## Assumptions

- Users are seeded in the database; there is no user-management UI.
- Single-tenant internal use; no multi-organization support.
- SQLite is sufficient for local/demo persistence.
- Frontend dev server proxies API calls to the backend on port 4000.
- All seeded demo users share one password (`SEED_PASSWORD`, default `Password123!`).
- Status transitions are enforced only on the backend; the frontend mirrors rules for UX.

## Clarifications (questions for a product owner)

1. Should REQUESTER users be allowed to delete their own tickets, or only AGENT/ADMIN?
   *(Implemented: AGENT/ADMIN only.)*
2. Should closed/cancelled tickets be editable?
   *(Implemented: fields remain editable for managers; status actions respect terminal states.)*
3. Is pagination required for large ticket lists?
   *(Not implemented; out of scope for v1.)*
4. Should email notifications fire on status change or new comment?
   *(Not implemented; out of scope.)*

## Edge Cases

| Edge case | Expected behaviour |
|-----------|-------------------|
| Invalid status transition (e.g. OPEN → CLOSED) | Backend returns 400; UI shows error message |
| Same-status transition (e.g. OPEN → OPEN) | Backend returns 400 |
| Ticket not found | Backend returns 404; UI shows not-found state |
| Missing/invalid JWT | Backend returns 401; frontend clears session and redirects to login |
| REQUESTER attempts PATCH or status change | Backend returns 403; UI hides manager controls |
| `assignedToId` references non-existent user | Backend returns 400 |
| Empty title/description on create or update | Frontend shows field errors; backend returns 400 |
| Network failure | Frontend shows user-friendly error via `ErrorBanner` / toast |
| No tickets match search/filter | Empty state with guidance to adjust filters |
| Wrong login password | Generic 401: "Invalid email or password" (no email enumeration) |
| Terminal status (CLOSED, CANCELLED) | No further status actions shown |
