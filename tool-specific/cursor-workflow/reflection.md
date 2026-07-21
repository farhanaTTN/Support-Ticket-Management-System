# Reflection

## What I Built

A full-stack Support Ticket Management System with:

- **Backend:** Express + TypeScript API with Prisma/SQLite persistence, Zod validation,
  JWT authentication, bcrypt passwords, and a backend-enforced ticket status state machine.
- **Frontend:** React + Vite SPA with responsive ticket card grid, light/dark theme toggle,
  toast notifications, loading skeletons, empty states, and role-aware UI.
- **Tests:** Backend integration tests for state-machine transitions and auth/authorization.
- **Docs:** README, API contract, design notes, and submission artifacts.

## How I Used AI (across the lifecycle)

| Phase | AI role |
|-------|---------|
| Requirements | Structured functional/non-functional requirements and edge cases from the project brief |
| Design | Proposed architecture (routes → services → domain), component breakdown, CSS theming approach |
| Implementation | Generated React components, CSS, API routes, services, and context providers |
| Debugging | Traced login 401 errors; compared network payload vs seed password; verified API directly |
| Testing | Identified test gaps (DELETE endpoint); confirmed integration test coverage |
| Documentation | Drafted all submission templates from existing spec and codebase |
| Review | Checked alignment with `.cursor/rules/support-ticket.mdc` constraints |

## What AI Helped With Most

- **Rapid UI scaffolding** — ticket cards, theme system, toast notifications, and responsive
  CSS were generated quickly while following existing project conventions.
- **Boilerplate reduction** — API client methods, Zod schemas, and service layer patterns
  were consistent without manual repetition.
- **Debugging login issues** — AI traced the full auth flow and identified the password
  mismatch (`Password123` vs `Password123!`) faster than trial-and-error alone.
- **Documentation** — Converting implementation details into structured submission artifacts.

## What AI Got Wrong

- Initially suggested clearing "cache" for login 401 when the real issue was the wrong password.
- Some terminal diagnostic commands produced no visible output in the Windows/PowerShell environment,
  requiring alternative approaches (direct API call via `Invoke-RestMethod`).
- Proposed broad password-reset scripts that would mutate all user hashes — unnecessary since
  the database was already correctly seeded.

## How I Validated AI Output

1. **Ran integration tests** — `cd backend && npm test` after every backend change.
2. **TypeScript compilation** — `npx tsc --noEmit` in both frontend and backend.
3. **Direct API testing** — called `POST /api/auth/login` from terminal to isolate UI vs backend issues.
4. **Manual smoke tests** — login → create ticket → status change → comment → delete → theme toggle.
5. **Cross-checked rules** — verified state machine lives in one module, status only via dedicated endpoint,
   creator/author from token.
6. **Read generated code** — reviewed AI output for security issues (hardcoded secrets, auth bypasses).

## What I Would Improve Next

- Add integration test for `DELETE /api/tickets/:id`.
- Add React Testing Library component tests for `TicketForm` and `TicketCard`.
- Add E2E tests with Playwright for the full login → CRUD flow.
- Implement pagination and sorting on the ticket list.
- Replace emoji theme toggle with accessible SVG icons and `aria-pressed`.
- Add inline edit on the card grid instead of navigating to detail for edits.
- Ensure `backend/.env` is always loaded (e.g. `dotenv` explicit import) to eliminate JWT_SECRET warning.

## Reusable Workflow (prompts, rules, specs, templates)

| Artifact | Location | Purpose |
|----------|----------|---------|
| Cursor rules | `.cursor/rules/support-ticket.mdc` | Persistent guardrails for AI agents |
| Project context | `tool-specific/cursor-workflow/project-context.md` | Product, entities, stack decisions |
| Spec | `tool-specific/cursor-workflow/spec.md` | Functional requirements, API, validation |
| Tasks | `tool-specific/cursor-workflow/tasks.md` | Ordered implementation checklist |
| Acceptance criteria | `tool-specific/cursor-workflow/acceptance-criteria.md` | Verifiable done conditions |
| Submission templates | `tool-specific/cursor-workflow/*.md` | Assessment artifacts |
| Cursor instructions | `tool-specific/cursor-workflow/cursor-rules-or-instructions.md` | Human-readable rule summary |

**Effective prompt pattern used:**
> "Implement [feature] following existing conventions in [file]. Do not duplicate
> state-machine logic. Keep tests green. Minimal diff."

**Key rule that prevented bugs:**
> Status changes ONLY through `POST /api/tickets/:id/status`. Never modify status via PATCH.
