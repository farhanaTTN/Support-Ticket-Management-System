import { z } from "zod";
import { TICKET_STATUSES } from "../domain/ticketStatus.js";

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export const createTicketSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().min(1, "Description is required").max(5000),
  priority: z.enum(PRIORITIES),
  createdById: z.string().min(1, "createdById is required"),
  assignedToId: z.string().min(1).optional().nullable(),
});

// At least one updatable field must be present.
export const updateTicketSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(1).max(5000).optional(),
    priority: z.enum(PRIORITIES).optional(),
    assignedToId: z.string().min(1).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const changeStatusSchema = z.object({
  status: z.enum(TICKET_STATUSES),
});

export const createCommentSchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(5000),
  createdById: z.string().min(1, "createdById is required"),
});

export const listTicketsQuerySchema = z.object({
  q: z.string().trim().optional(),
  status: z.enum(TICKET_STATUSES).optional(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
