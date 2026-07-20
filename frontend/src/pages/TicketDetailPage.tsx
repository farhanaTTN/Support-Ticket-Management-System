import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../api/client";
import { CommentList } from "../components/CommentList";
import { ErrorBanner } from "../components/ErrorBanner";
import { StatusActions } from "../components/StatusActions";
import { StatusBadge } from "../components/StatusBadge";
import { PRIORITIES } from "../status";
import { useAuth } from "../authContext";
import { canManageTickets, type Priority, type Ticket, type TicketStatus } from "../types";

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { users, currentUser } = useAuth();
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

  async function saveFields() {
    if (!id) return;
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required");
      return;
    }
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
    } catch (err) {
      // Surfaces backend state-machine rejections clearly.
      setError(err instanceof ApiError ? err.message : "Failed to change status");
    } finally {
      setBusy(false);
    }
  }

  async function handleAddComment() {
    if (!id) return;
    if (!newComment.trim()) {
      setError("Comment message is required");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.addComment(id, { message: newComment.trim() });
      setNewComment("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add comment");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p>
        <Link to="/">Back to tickets</Link>
      </p>

      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      {loading ? (
        <p className="muted">Loading...</p>
      ) : !ticket ? (
        <p className="muted">Ticket unavailable.</p>
      ) : (
        <>
          <div className="card">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <h2 style={{ margin: 0 }}>{ticket.title}</h2>
              <StatusBadge status={ticket.status} />
            </div>
            <p className="muted">
              Created by {ticket.createdBy.name} on{" "}
              {new Date(ticket.createdAt).toLocaleString()}
            </p>

            <h3>Status</h3>
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
          <div className="card">
            <h3>Edit details</h3>
            <div className="row">
              <div className="grow">
                <label htmlFor="d-title">Title</label>
                <input
                  id="d-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>
            <div className="row">
              <div className="grow">
                <label htmlFor="d-desc">Description</label>
                <textarea
                  id="d-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="row">
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
            <div className="row" style={{ marginTop: 12 }}>
              <button onClick={saveFields} disabled={busy}>
                Save changes
              </button>
            </div>
          </div>
          )}

          <div className="card">
            <h3>Comments</h3>
            <CommentList comments={ticket.comments ?? []} />
            <div className="row" style={{ marginTop: 12 }}>
              <div className="grow">
                <label htmlFor="new-comment">Add a comment</label>
                <textarea
                  id="new-comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment"
                />
              </div>
            </div>
            <div className="row" style={{ marginTop: 8 }}>
              <button onClick={handleAddComment} disabled={busy}>
                Add comment
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
