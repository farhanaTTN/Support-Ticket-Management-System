import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../api/client";
import { ErrorBanner } from "../components/ErrorBanner";
import { StatusBadge } from "../components/StatusBadge";
import { TicketForm, type TicketFormValues } from "../components/TicketForm";
import { STATUSES, statusLabel } from "../status";
import { useUsers } from "../userContext";
import type { Ticket, TicketStatus } from "../types";

export function TicketsPage() {
  const { actingUser } = useUsers();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listTickets({ q, status });
      setTickets(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [q, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(values: TicketFormValues) {
    if (!actingUser) {
      setError("Select an acting user before creating a ticket");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.createTicket({ ...values, createdById: actingUser.id });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      <div className="card">
        <h2>Create ticket</h2>
        <TicketForm onSubmit={handleCreate} submitting={submitting} />
      </div>

      <div className="card">
        <h2>Tickets</h2>
        <div className="row" style={{ marginBottom: 12 }}>
          <div className="grow">
            <label htmlFor="search">Keyword search</label>
            <input
              id="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title or description"
            />
          </div>
          <div style={{ minWidth: 180 }}>
            <label htmlFor="status-filter">Filter by status</label>
            <select
              id="status-filter"
              value={status}
              onChange={(e) => setStatus(e.target.value as TicketStatus | "")}
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="muted">Loading...</p>
        ) : tickets.length === 0 ? (
          <p className="muted">No tickets found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assignee</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td>
                    <Link to={`/tickets/${t.id}`}>{t.title}</Link>
                  </td>
                  <td>
                    <StatusBadge status={t.status} />
                  </td>
                  <td>{t.priority}</td>
                  <td>{t.assignedTo?.name ?? "Unassigned"}</td>
                  <td className="muted">
                    {new Date(t.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
