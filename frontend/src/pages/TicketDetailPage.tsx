import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "../api/client";
import { CommentList } from "../components/CommentList";
import { ErrorBanner } from "../components/ErrorBanner";
import { StatusActions } from "../components/StatusActions";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import { PageSpinner } from "../components/Spinner";
import { PRIORITIES } from "../status";
import { useAuth } from "../authContext";
import { useToast } from "../toastContext";
import { canManageTickets, type Priority, type Ticket, type TicketStatus } from "../types";

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { users, currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const canManage = currentUser ? canManageTickets(currentUser.role) : false;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [assignedToId, setAssignedToId] = useState("");
  const [newComment, setNewComment] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTicket(id);
      setTicket(data);
      setTitle(data.title);
      setDescription(data.description);
      setPriority(data.priority);
      setAssignedToId(data.assignedToId ?? "");
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError("Ticket not found");
        setTicket(null);
      } else {
        setError(err instanceof ApiError ? err.message : "Failed to load ticket");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  function validateFields(): boolean {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required";
    if (!description.trim()) errs.description = "Description is required";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function saveFields() {
    if (!id) return;
    if (!validateFields()) return;
    setBusy(true);
    setError(null);
    try {
      await api.updateTicket(id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        assignedToId: assignedToId || null,
      });
      await load();
      showToast("Ticket updated.", "success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update ticket");
    } finally {
      setBusy(false);
    }
  }

  async function handleStatusChange(next: TicketStatus) {
    if (!id) return;
    setBusy(true);
    setError(null);
    try {
      await api.changeStatus(id, next);
      await load();
      showToast(`Status changed to ${next.replace("_", " ")}.`, "success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to change status");
    } finally {
      setBusy(false);
    }
  }

  async function handleAddComment() {
    if (!id) return;
    if (!newComment.trim()) {
      setFieldErrors((p) => ({ ...p, comment: "Comment cannot be empty" }));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.addComment(id, { message: newComment.trim() });
      setNewComment("");
      setFieldErrors((p) => ({ ...p, comment: "" }));
      await load();
      showToast("Comment added.", "success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add comment");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!window.confirm(`Delete this ticket? This cannot be undone.`)) return;
    try {
      await api.deleteTicket(id);
      showToast("Ticket deleted.", "success");
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete ticket");
    }
  }

  return (
    <div>
      <Link to="/" className="back-link">
        ← Back to tickets
      </Link>

      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      {loading ? (
        <PageSpinner />
      ) : !ticket ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p className="empty-title">Ticket not found</p>
          <p className="empty-subtitle">
            This ticket may have been deleted or does not exist.
          </p>
        </div>
      ) : (
        <>
          {/* Header card */}
          <div className="card">
            <div className="detail-header">
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 className="detail-title">{ticket.title}</h2>
                <p className="detail-meta">
                  #{ticket.id.slice(0, 8).toUpperCase()} · Created by{" "}
                  <strong>{ticket.createdBy.name}</strong> on{" "}
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>
            </div>

            <p style={{ margin: "12px 0 16px", lineHeight: 1.65 }}>
              {ticket.description}
            </p>

            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: 16,
                marginTop: 8,
              }}
            >
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 600 }}>
                Status actions
              </h3>
              {canManage ? (
                <StatusActions
                  status={ticket.status}
                  disabled={busy}
                  onChange={handleStatusChange}
                />
              ) : (
                <p className="muted">
                  Only agents and admins can change ticket status.
                </p>
              )}
            </div>

            {canManage && (
              <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="danger"
                  onClick={handleDelete}
                  disabled={busy}
                  style={{ fontSize: 13, padding: "7px 14px" }}
                >
                  Delete ticket
                </button>
              </div>
            )}
          </div>

          {/* Edit details (managers only) */}
          {canManage && (
            <div className="card">
              <h3 className="card-title">Edit details</h3>
              <div className="row">
                <div className="grow">
                  <label htmlFor="d-title">Title</label>
                  <input
                    id="d-title"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (fieldErrors.title)
                        setFieldErrors((p) => ({ ...p, title: "" }));
                    }}
                  />
                  {fieldErrors.title && (
                    <div className="field-error">⚠ {fieldErrors.title}</div>
                  )}
                </div>
              </div>
              <div className="row" style={{ marginTop: 14 }}>
                <div className="grow">
                  <label htmlFor="d-desc">Description</label>
                  <textarea
                    id="d-desc"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (fieldErrors.description)
                        setFieldErrors((p) => ({ ...p, description: "" }));
                    }}
                  />
                  {fieldErrors.description && (
                    <div className="field-error">⚠ {fieldErrors.description}</div>
                  )}
                </div>
              </div>
              <div className="row" style={{ marginTop: 14 }}>
                <div className="grow">
                  <label htmlFor="d-priority">Priority</label>
                  <select
                    id="d-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grow">
                  <label htmlFor="d-assignee">Assignee</label>
                  <select
                    id="d-assignee"
                    value={assignedToId}
                    onChange={(e) => setAssignedToId(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="row" style={{ marginTop: 16 }}>
                <button onClick={saveFields} disabled={busy}>
                  {busy ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="card">
            <h3 className="card-title">
              Comments ({ticket.comments?.length ?? 0})
            </h3>
            <CommentList comments={ticket.comments ?? []} />
            <div style={{ marginTop: 16 }}>
              <label htmlFor="new-comment">Add a comment</label>
              <textarea
                id="new-comment"
                value={newComment}
                onChange={(e) => {
                  setNewComment(e.target.value);
                  if (fieldErrors.comment)
                    setFieldErrors((p) => ({ ...p, comment: "" }));
                }}
                placeholder="Write your comment…"
              />
              {fieldErrors.comment && (
                <div className="field-error">⚠ {fieldErrors.comment}</div>
              )}
              <div className="row" style={{ marginTop: 10 }}>
                <button
                  onClick={handleAddComment}
                  disabled={busy || !newComment.trim()}
                >
                  Add comment
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
