import { useNavigate } from "react-router-dom";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { canManageTickets, type Ticket } from "../types";
import { useAuth } from "../authContext";

interface TicketCardProps {
  ticket: Ticket;
  onDelete?: (id: string) => void;
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}

export function TicketCard({ ticket, onDelete }: TicketCardProps) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const canManage = currentUser ? canManageTickets(currentUser.role) : false;

  const shortId = ticket.id.slice(0, 8).toUpperCase();
  const createdDate = new Date(ticket.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="ticket-card">
      <div className="ticket-card-header">
        <span className="ticket-id">#{shortId}</span>
        <div className="ticket-badges">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>

      <h3 className="ticket-title">{ticket.title}</h3>
      <p className="ticket-description">{truncate(ticket.description, 120)}</p>

      <div className="ticket-meta">
        <div className="ticket-meta-row">
          <span className="meta-icon">👤</span>
          <span className="muted">
            {ticket.assignedTo ? ticket.assignedTo.name : "Unassigned"}
          </span>
        </div>
        <div className="ticket-meta-row">
          <span className="meta-icon">📅</span>
          <span className="muted">{createdDate}</span>
        </div>
      </div>

      <div className="ticket-actions">
        <button
          className="btn-card btn-view"
          onClick={() => navigate(`/tickets/${ticket.id}`)}
        >
          View
        </button>
        {canManage && (
          <>
            <button
              className="btn-card btn-edit"
              onClick={() => navigate(`/tickets/${ticket.id}`)}
            >
              Edit
            </button>
            {onDelete && (
              <button
                className="btn-card btn-delete"
                onClick={() => {
                  if (
                    window.confirm(
                      `Delete ticket "${ticket.title}"? This cannot be undone.`
                    )
                  ) {
                    onDelete(ticket.id);
                  }
                }}
              >
                Delete
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
