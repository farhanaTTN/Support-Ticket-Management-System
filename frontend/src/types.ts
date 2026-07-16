export type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "CANCELLED";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
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
