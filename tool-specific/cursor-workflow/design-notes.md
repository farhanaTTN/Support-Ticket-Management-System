# Design Notes

## Architecture Overview (frontend, backend, database)

```
┌─────────────────────────────────────────────────────────┐
│  React + Vite (localhost:5173)                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │ Pages       │  │ Components   │  │ Contexts       │ │
│  │ TicketsPage │  │ TicketCard   │  │ authContext    │ │
│  │ DetailPage  │  │ TicketForm   │  │ themeContext   │ │
│  │ LoginPage   │  │ StatusBadge  │  │ toastContext   │ │
│  └──────┬──────┘  └──────────────┘  └────────────────┘ │
│         │ api/client.ts (fetch + JWT header)            │
└─────────┼───────────────────────────────────────────────┘
          │ /api/* (Vite proxy → :4000)
┌─────────▼───────────────────────────────────────────────┐
│  Express + TypeScript (localhost:4000)                    │
│  ┌──────────┐  ┌────────────┐  ┌─────────────────────┐ │
│  │ Routes   │→ │ Middleware │→ │ Services            │ │
│  │ auth     │  │ requireAuth│  │ ticketService       │ │
│  │ tickets  │  │ requireRole│  │ commentService      │ │
│  │ users    │  │ errorHandler│ │ authService         │ │
│  └──────────┘  └────────────┘  └──────────┬──────────┘ │
│                                              │            │
│  ┌──────────────────────────────────────────▼──────────┐ │
│  │ Domain: ticketStatus.ts (state machine)            │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────┘
                          │ Prisma ORM
┌─────────────────────────▼───────────────────────────────┐
│  SQLite (file:./dev.db)                                 │
│  Tables: User, Ticket, Comment                          │
└─────────────────────────────────────────────────────────┘
```

## Frontend Design

### Routing

| Path | Component | Auth |
|------|-----------|------|
| `/login` | `LoginPage` | Public |
| `/` | `TicketsPage` | Protected |
| `/tickets/:id` | `TicketDetailPage` | Protected |

### Key components

| Component | Responsibility |
|-----------|----------------|
| `TicketCard` | Grid card with badges, meta, View/Edit/Delete actions |
| `TicketForm` | Create-ticket form with client-side validation |
| `StatusBadge` / `PriorityBadge` | Color-coded pills |
| `StatusActions` | Renders only valid next statuses from state machine mirror |
| `ErrorBanner` | Dismissible alert for API errors |
| `ThemeToggle` | Light/dark switch in top bar |
| `Spinner` / `CardSkeletonGrid` | Loading states |
| `RequireAuth` | Redirects to login when unauthenticated |

### State management

- `authContext` — current user, users list, login/logout, session restore
- `themeContext` — theme preference, `localStorage` persistence, `data-theme` on `<html>`
- `toastContext` — ephemeral success/error/info notifications

### Styling

- CSS custom properties for light/dark themes (`[data-theme="light"]`)
- Responsive grid: `grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))`
- Card hover effects, skeleton shimmer, toast slide-up animation

## Backend Design

### Layering

1. **Routes** — HTTP mapping, Zod parse at boundary, call services
2. **Middleware** — `requireAuth`, `requireRole`, central `errorHandler`
3. **Services** — business logic, Prisma queries, existence checks
4. **Domain** — `ticketStatus.ts` transition rules (single source of truth)

### Auth flow

1. `POST /api/auth/login` → verify bcrypt hash → sign JWT
2. Protected routes extract `Bearer` token → `verifyToken` → attach `req.user`
3. Role-gated routes check `req.user.role` against allowed set

### Status change rule

`PATCH /api/tickets/:id` must **never** modify `status`. Only
`POST /api/tickets/:id/status` calls `changeStatus()` which uses `canTransition()`.

## Database Design

### Entities

```
User
  id, name, email, role, passwordHash

Ticket
  id, title, description, priority, status
  assignedToId → User (nullable)
  createdById  → User
  createdAt, updatedAt

Comment
  id, ticketId → Ticket, message
  createdById  → User
  createdAt
```

### Enums (application-level)

- `priority`: LOW, MEDIUM, HIGH, CRITICAL
- `status`: OPEN, IN_PROGRESS, RESOLVED, CLOSED, CANCELLED
- `role`: ADMIN, AGENT, REQUESTER

SQLite stores these as strings; Zod and domain modules validate values.

## Validation Strategy

| Layer | What is validated |
|-------|-------------------|
| Frontend forms | Required fields, email format (login), inline field errors |
| Zod schemas (routes) | Types, lengths, enums, email format |
| Services | User existence for `assignedToId`, state-machine transitions |
| Domain | `canTransition(from, to)` before status update |

## Error Handling Strategy

| HTTP | When | Frontend behaviour |
|------|------|-------------------|
| 400 | Validation failure, invalid transition | `ErrorBanner` + message from `error` field |
| 401 | Missing/invalid token, bad login | Clear session; redirect to login |
| 403 | Insufficient role | Error message; controls hidden in UI |
| 404 | Ticket not found | Empty/not-found state on detail page |
| 0 | Network error | "Could not reach the server" |

Central handler in `backend/src/middleware/errorHandler.ts` ensures consistent JSON shape.

## Testing Strategy Link

See [test-strategy.md](test-strategy.md) for scope, test types, and coverage gaps.
