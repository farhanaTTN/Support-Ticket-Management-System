import { statusLabel } from "../status";
import type { TicketStatus } from "../types";

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <span className={`badge ${status}`}>{statusLabel(status)}</span>;
}
