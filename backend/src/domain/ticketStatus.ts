// Single source of truth for the ticket status lifecycle (state machine).
// Both the service layer and the frontend rely on these rules so behaviour
// stays consistent. Changing a status is only allowed via an explicit,
// permitted transition; everything else is rejected.

export const TICKET_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "CANCELLED",
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

// Allowed transitions:
//   OPEN         -> IN_PROGRESS, CANCELLED
//   IN_PROGRESS  -> RESOLVED, CANCELLED
//   RESOLVED     -> CLOSED
//   CLOSED       -> (terminal)
//   CANCELLED    -> (terminal)
export const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["RESOLVED", "CANCELLED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
  CANCELLED: [],
};

export function isTicketStatus(value: unknown): value is TicketStatus {
  return (
    typeof value === "string" &&
    (TICKET_STATUSES as readonly string[]).includes(value)
  );
}

export function canTransition(from: TicketStatus, to: TicketStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function nextStatuses(from: TicketStatus): TicketStatus[] {
  return ALLOWED_TRANSITIONS[from] ?? [];
}
