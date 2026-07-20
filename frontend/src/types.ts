export type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "CANCELLED";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type Role = "ADMIN" | "AGENT" | "REQUESTER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResult {
  token: string;
  user: User;
}

// Roles permitted to update tickets and change status (must match backend).
export const MANAGER_ROLES: Role[] = ["ADMIN", "AGENT"];

export function canManageTickets(role: string): boolean {
  return (MANAGER_ROLES as string[]).includes(role);
}

export interface Comment {
  id: string;
  ticketId: string;
  message: string;
  createdAt: string;
  createdBy: User;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  assignedToId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  assignedTo: User | null;
  comments?: Comment[];
  allowedNextStatuses?: TicketStatus[];
}
