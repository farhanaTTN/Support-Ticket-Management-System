import type {
  AuthResult,
  Comment,
  Priority,
  Ticket,
  TicketStatus,
  User,
} from "../types";

const TOKEN_KEY = "stms.token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// Registered by the auth provider so a 401 anywhere clears the session.
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

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
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers ?? {}),
      },
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
    // A 401 on any non-login call means the session is gone/expired.
    if (res.status === 401 && !url.endsWith("/auth/login")) {
      onUnauthorized?.();
    }
    throw new ApiError(res.status, message, body?.details);
  }

  return body as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<AuthResult>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<User>("/api/auth/me"),

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

  addComment: (id: string, input: { message: string }) =>
    request<Comment>(`/api/tickets/${id}/comments`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
};
