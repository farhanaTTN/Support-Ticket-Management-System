# Cursor Rules / Instructions

Persistent guidance for AI agents working on this repository. These mirror the
enforced rule in `.cursor/rules/support-ticket.mdc`.

## Architecture

- Keep the ticket status state machine in ONE module:
  `backend/src/domain/ticketStatus.ts`. Do not duplicate transition logic in
  services or routes. The frontend mirror in `frontend/src/status.ts` is for UX
  only and must stay consistent with the backend.
- Status may change ONLY through `POST /api/tickets/:id/status`. Never allow
  status updates via the generic `PATCH /api/tickets/:id` endpoint.

## Validation and errors

- Validate all request input at the boundary with Zod
  (`backend/src/validators/`). Reject invalid input with HTTP 400.
- Use the central error handler and the `{ error, details? }` JSON shape. Do not
  invent per-route error formats.
- Invalid state transitions must fail closed on the server (return 400), never
  silently succeed.

## Security

- Never commit secrets. Only `.env.example` is tracked; `.env` and `*.db` are
  git-ignored.
- No hardcoded credentials, no disabled TLS, no permissive CORS beyond the
  configured origin.
- `JWT_SECRET` is read from the environment; passwords are bcrypt-hashed.

## Auth and authorization

- All routes except `POST /api/auth/login` and `GET /api/health` require a valid
  JWT (`requireAuth`). `PATCH /tickets/:id` and `POST /tickets/:id/status`
  additionally require `requireRole("AGENT","ADMIN")`.
- Never accept the ticket creator or comment author from the request body;
  derive it from the token (`req.user.sub`). Keep the frontend `MANAGER_ROLES`
  mirror consistent with the backend role policy.

## Testing

- The state-machine integration tests are mandatory and must stay green:
  `backend/tests/ticketStatus.integration.test.ts`.
- Any change to transition rules must update both the tests and
  `tool-specific/cursor-workflow/spec.md`.

## Conventions

- Follow existing naming, folder structure, and formatting.
- Prefer the smallest reviewable change; do not add dependencies or refactor
  broadly without justification.
- Keep spec -> tasks -> acceptance-criteria in sync when behaviour changes.
