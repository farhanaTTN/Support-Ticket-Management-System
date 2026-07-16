import type {
  Comment,
  Priority,
  Ticket,
  TicketStatus,
  User,
} from "../types";

// Thrown for non-2xx responses; carries the backend error message and details.
export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new ApiError(0, "Network error: could not reach the server");
  }

  const isJson = res.headers
    .get("content-type")
    ?.includes("application/json");
  const body = isJson ? await res.json() : undefined;

  if (!res.ok) {
    const message =
      (body && (body.error as string)) || `Request failed (${res.status})`;
    throw new ApiError(res.status, message, body?.details);
  }

  return body as T;
}

export const api = {
  listUsers: () => request<User[]>("/api/users"),

  listTickets: (params: { q?: string; status?: TicketStatus | "" }) => {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    if (params.status) search.set("status", params.status);
    const qs = search.toString();
    return request<Ticket[]>(`/api/tickets${qs ? `?${qs}` : ""}`);
  },

  getTicket: (id: string) => request<Ticket>(`/api/tickets/${id}`),

  createTicket: (input: {
    title: string;
    description: string;
    priority: Priority;
    createdById: string;
    assignedToId?: string | null;
  }) =>
    request<Ticket>("/api/tickets", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateTicket: (
    id: string,
    input: {
      title?: string;
      description?: string;
      priority?: Priority;
      assignedToId?: string | null;
    }
  ) =>
    request<Ticket>(`/api/tickets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  changeStatus: (id: string, status: TicketStatus) =>
    request<Ticket>(`/api/tickets/${id}/status`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }),

  addComment: (id: string, input: { message: string; createdById: string }) =>
    request<Comment>(`/api/tickets/${id}/comments`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
};
