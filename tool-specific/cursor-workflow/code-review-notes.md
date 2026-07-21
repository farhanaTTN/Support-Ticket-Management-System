# Code Review Notes

## AI-Assisted Review Summary

AI reviewed the implementation against the project rules in
`.cursor/rules/support-ticket.mdc` and the spec in `spec.md`. Key checks:

| Area | Finding |
|------|---------|
| State machine | Single module at `backend/src/domain/ticketStatus.ts` — no duplication in services |
| Status endpoint | PATCH does not modify status; only `POST /:id/status` does |
| Auth trust boundary | `createdById` and comment author derived from `req.user.sub` |
| Validation | Zod schemas at route boundary; consistent `{ error, details? }` shape |
| Secrets | `.env` and `*.db` git-ignored; only `.env.example` tracked |
| Frontend mirror | `frontend/src/status.ts` matches backend transitions for UX only |
| Role policy | `MANAGER_ROLES` in `frontend/src/types.ts` matches backend `requireRole` |

## My Review Observations

### Strengths

- Clear separation of concerns: routes → services → domain → Prisma.
- Integration tests cover the most critical paths (transitions + auth).
- Frontend contexts (`auth`, `theme`, `toast`) are focused and composable.
- CSS theming via custom properties avoids a heavy UI framework dependency.
- Error handling is consistent end-to-end.

### Areas to watch

- `DELETE` endpoint was added after the initial test suite — needs an integration test.
- Frontend has no automated component tests; regressions rely on manual checks.
- `ThemeToggle` uses emoji icons — accessible but not ideal for all platforms; could use SVG icons.
- Card grid "Edit" button navigates to the same detail page as "View" — acceptable but could open an inline edit modal in future.

## Changes Made After Review

| Change | Reason |
|--------|--------|
| Added `DELETE /api/tickets/:id` with AGENT/ADMIN guard | Required by UI/UX spec (Delete action on cards) |
| Updated login page hint with explicit `Password123!` | Prevent repeated login confusion |
| Added `toastContext` for success/error feedback | Better UX than error banner alone for transient messages |
| Added skeleton loading grid | Avoid layout shift while tickets load |
| Improved `StatusBadge` labels ("In Progress" vs "IN_PROGRESS") | Readability |

## Suggestions Rejected (and why)

| Suggestion | Why rejected |
|------------|--------------|
| Add Redux or Zustand for state | React context is sufficient for this app size; avoids new dependency |
| Add React Testing Library now | Out of scope for assessment timeline; integration tests cover critical backend rules |
| Allow status change via PATCH with a flag | Violates spec — status must use dedicated endpoint only |
| Accept `createdById` from request body for convenience | Security risk — must derive from token |
| Add pagination to ticket list | Out of scope; not required for v1 |
| Use a CSS framework (Tailwind, MUI) | Existing plain CSS approach is working; adding a framework increases bundle and learning curve |
| Hardcode demo password in seed script | Password must come from `SEED_PASSWORD` env var per security rules |
