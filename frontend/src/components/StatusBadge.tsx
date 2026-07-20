import { statusLabel } from "../status";
import type { TicketStatus } from "../types";

const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  CANCELLED: "Cancelled",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`badge ${status}`}>{STATUS_LABELS[status] ?? statusLabel(status)}</span>
  );
}
