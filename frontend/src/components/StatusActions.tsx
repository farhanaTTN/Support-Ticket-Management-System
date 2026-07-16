import { ALLOWED_TRANSITIONS, statusLabel } from "../status";
import type { TicketStatus } from "../types";

interface StatusActionsProps {
  status: TicketStatus;
  disabled?: boolean;
  onChange: (next: TicketStatus) => void;
}

// Renders a button only for valid next statuses derived from the state machine.
export function StatusActions({ status, disabled, onChange }: StatusActionsProps) {
  const next = ALLOWED_TRANSITIONS[status] ?? [];

  if (next.length === 0) {
    return <p className="muted">This ticket is {statusLabel(status)} (terminal state).</p>;
  }

  return (
    <div className="actions">
      {next.map((target) => (
        <button
          key={target}
          className="secondary"
          disabled={disabled}
          onClick={() => onChange(target)}
        >
          Move to {statusLabel(target)}
        </button>
      ))}
    </div>
  );
}
