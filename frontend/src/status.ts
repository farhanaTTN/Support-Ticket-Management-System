import type { Priority, TicketStatus } from "./types";

// Frontend mirror of the backend state machine. The backend remains the
// source of truth and rejects invalid transitions; this is used to render
// only the valid actions in the UI.
export const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["RESOLVED", "CANCELLED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
  CANCELLED: [],
};

export const STATUSES: TicketStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "CANCELLED",
];

export const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export function statusLabel(status: TicketStatus): string {
  return status.replace("_", " ");
}
