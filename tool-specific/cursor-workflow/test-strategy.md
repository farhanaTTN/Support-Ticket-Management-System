# Test Strategy

## Test Scope

Automated tests focus on **backend integration tests** because the most critical
business rules — status transitions and authorization — must be enforced server-side.
Frontend behaviour is verified through manual smoke testing and TypeScript compilation.

Test runner: Vitest + Supertest  
Test database: isolated SQLite (`file:./test.db`)  
Location: `backend/tests/`

## Unit Tests

| Area | Status | Notes |
|------|--------|-------|
| `ticketStatus.ts` domain functions | Covered indirectly | Tested via integration tests against real HTTP endpoints |
| Service functions in isolation | Not covered | Services are thin wrappers around Prisma; integration tests provide sufficient confidence for this scope |
| Frontend utility functions | Not covered | `statusLabel`, `canManageTickets` are trivial mirrors |

## Component Tests

| Component | Status | Notes |
|-----------|--------|-------|
| React components (TicketCard, TicketForm, etc.) | Not covered | No React Testing Library setup; manual UI verification used instead |
| Theme toggle / toast context | Not covered | Verified manually |

## API / Integration Tests

### `ticketStatus.integration.test.ts`

| Test case | What it verifies |
|-----------|-----------------|
| Valid transitions | OPEN→IN_PROGRESS, IN_PROGRESS→RESOLVED, RESOLVED→CLOSED, OPEN→CANCELLED, IN_PROGRESS→CANCELLED |
| Invalid transitions | OPEN→CLOSED, OPEN→RESOLVED, CLOSED→OPEN, etc. return 400 |
| Self-transition | OPEN→OPEN returns 400 |
| Unknown status value | Returns 400 |
| Status via PATCH blocked | PATCH cannot change status field |
| `allowedNextStatuses` in detail response | Matches state machine |

### `auth.integration.test.ts`

| Test case | What it verifies |
|-----------|-----------------|
| Login with valid credentials | Returns 200 + JWT |
| Login with wrong password | Returns 401 |
| Protected route without token | Returns 401 |
| Protected route with valid token | Returns 200 |
| AGENT can PATCH ticket | Returns 200 |
| REQUESTER cannot PATCH ticket | Returns 403 |
| AGENT can change status | Returns 200 |
| REQUESTER cannot change status | Returns 403 |
| Comment author from token | Comment `createdBy` matches authenticated user |
| Ticket creator from token | Ticket `createdBy` matches authenticated user |

### How to run

```bash
cd backend
npm test
```

## Edge Case Tests

| Edge case | Covered by |
|-----------|-----------|
| Invalid status transition matrix | `ticketStatus.integration.test.ts` |
| Self-transition rejection | `ticketStatus.integration.test.ts` |
| Role-based 403 on PATCH/status | `auth.integration.test.ts` |
| Creator/author spoofing prevention | `auth.integration.test.ts` |
| Delete ticket (AGENT only) | Manual / not yet automated |
| Search and filter query params | Manual |
| Frontend form validation | Manual |
| Theme persistence | Manual |
| Network error handling | Manual |

## Tests Not Covered (and why)

| Gap | Reason |
|-----|--------|
| Frontend component unit tests | Out of scope for v1; would require adding React Testing Library |
| E2E browser tests (Playwright/Cypress) | Not required; manual smoke test sufficient for assessment scope |
| DELETE endpoint integration test | Added after initial test suite; should be added in next iteration |
| Pagination / sorting | Feature not implemented |
| Load/performance tests | Not required for internal demo app |
| SQLite migration tests | Prisma handles schema; migrations verified manually via `db:migrate` |

## Manual Test Checklist

- [ ] Login with AGENT and REQUESTER accounts
- [ ] Create ticket → appears in card grid
- [ ] Search by keyword and filter by status
- [ ] Open detail → edit fields → save
- [ ] Change status through valid actions only
- [ ] Attempt invalid transition → see error
- [ ] Add comment → appears in thread
- [ ] Delete ticket (AGENT) → removed from list
- [ ] Toggle light/dark theme → persists on refresh
- [ ] Sign out → redirected to login
- [ ] Restart backend → data still present
