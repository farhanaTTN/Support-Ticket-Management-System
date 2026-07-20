import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  changeStatusSchema,
  createCommentSchema,
  createTicketSchema,
  listTicketsQuerySchema,
  updateTicketSchema,
} from "../validators/ticketSchemas.js";
import {
  changeStatus,
  createTicket,
  deleteTicket,
  getTicket,
  listTickets,
  updateTicket,
} from "../services/ticketService.js";
import { addComment } from "../services/commentService.js";

export const ticketsRouter = Router();

// All ticket routes require authentication.
ticketsRouter.use(requireAuth);

ticketsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = listTicketsQuerySchema.parse(req.query);
    const tickets = await listTickets(query);
    res.json(tickets);
  })
);

ticketsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createTicketSchema.parse(req.body);
    const ticket = await createTicket(input, req.user!.sub);
    res.status(201).json(ticket);
  })
);

ticketsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const ticket = await getTicket(req.params.id);
    res.json(ticket);
  })
);

// Updating fields / reassigning is restricted to agents and admins.
ticketsRouter.patch(
  "/:id",
  requireRole("AGENT", "ADMIN"),
  asyncHandler(async (req, res) => {
    const input = updateTicketSchema.parse(req.body);
    const ticket = await updateTicket(req.params.id, input);
    res.json(ticket);
  })
);

// Deleting a ticket is restricted to agents and admins.
ticketsRouter.delete(
  "/:id",
  requireRole("AGENT", "ADMIN"),
  asyncHandler(async (req, res) => {
    await deleteTicket(req.params.id);
    res.status(204).end();
  })
);

ticketsRouter.post(
  "/:id/status",
  requireRole("AGENT", "ADMIN"),
  asyncHandler(async (req, res) => {
    const { status } = changeStatusSchema.parse(req.body);
    const ticket = await changeStatus(req.params.id, status);
    res.json(ticket);
  })
);

ticketsRouter.post(
  "/:id/comments",
  asyncHandler(async (req, res) => {
    const input = createCommentSchema.parse(req.body);
    const comment = await addComment(req.params.id, input, req.user!.sub);
    res.status(201).json(comment);
  })
);
