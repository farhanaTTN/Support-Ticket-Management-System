import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "../api/client";
import { ErrorBanner } from "../components/ErrorBanner";
import { TicketCard } from "../components/TicketCard";
import { TicketForm, type TicketFormValues } from "../components/TicketForm";
import { CardSkeletonGrid } from "../components/Spinner";
import { STATUSES, statusLabel } from "../status";
import { useToast } from "../toastContext";
import type { Ticket, TicketStatus } from "../types";

export function TicketsPage() {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

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
    setSubmitting(true);
    setError(null);
    try {
      await api.createTicket(values);
      await load();
      setShowForm(false);
      showToast("Ticket created successfully!", "success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.deleteTicket(id);
      setTickets((prev) => prev.filter((t) => t.id !== id));
      showToast("Ticket deleted.", "success");
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "Failed to delete ticket",
        "error"
      );
    }
  }

  return (
    <div>
      {/* Page header */}
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <h2 className="section-title">All Tickets</h2>
          <p className="muted" style={{ margin: "4px 0 0" }}>
            Manage and track support requests
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{ flexShrink: 0 }}
        >
          {showForm ? "✕ Cancel" : "+ New Ticket"}
        </button>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      {/* Create ticket form (collapsible) */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 className="card-title">Create New Ticket</h3>
          <TicketForm onSubmit={handleCreate} submitting={submitting} />
        </div>
      )}

      {/* Search & filter */}
      <div className="filter-bar">
        <div className="grow">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title or description…"
          />
        </div>
        <div style={{ minWidth: 180 }}>
          <label htmlFor="status-filter">Status</label>
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

      {/* Results */}
      {loading ? (
        <CardSkeletonGrid />
      ) : tickets.length === 0 ? (
        <EmptyState hasFilters={!!(q || status)} />
      ) : (
        <>
          <p className="results-count">
            {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} found
          </p>
          <div className="ticket-grid">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{hasFilters ? "🔍" : "🎫"}</div>
      <p className="empty-title">
        {hasFilters ? "No matching tickets" : "No tickets yet"}
      </p>
      <p className="empty-subtitle">
        {hasFilters
          ? "Try adjusting your search or filter to find what you're looking for."
          : "Create your first support ticket to get started."}
      </p>
    </div>
  );
}
