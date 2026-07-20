import { useState } from "react";
import { PRIORITIES } from "../status";
import { useAuth } from "../authContext";
import type { Priority } from "../types";

export interface TicketFormValues {
  title: string;
  description: string;
  priority: Priority;
  assignedToId: string | null;
}

interface TicketFormProps {
  onSubmit: (values: TicketFormValues) => Promise<void> | void;
  submitting?: boolean;
}

// Create-ticket form with client-side required-field checks. The backend
// performs authoritative validation; this only improves UX.
export function TicketForm({ onSubmit, submitting }: TicketFormProps) {
  const { users } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [assignedToId, setAssignedToId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "Title is required";
    if (!description.trim()) next.description = "Description is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      assignedToId: assignedToId || null,
    });
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setAssignedToId("");
    setErrors({});
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="grow">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short summary"
          />
          {errors.title && <div className="field-error">{errors.title}</div>}
        </div>
      </div>
      <div className="row">
        <div className="grow">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue"
          />
          {errors.description && (
            <div className="field-error">{errors.description}</div>
          )}
        </div>
      </div>
      <div className="row">
        <div className="grow">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
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
          <label htmlFor="assignee">Assign to (optional)</label>
          <select
            id="assignee"
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
        <button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create ticket"}
        </button>
      </div>
    </form>
  );
}
