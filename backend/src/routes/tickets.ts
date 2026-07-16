import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
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
  getTicket,
  listTickets,
  updateTicket,
} from "../services/ticketService.js";
import { addComment } from "../services/commentService.js";

export const ticketsRouter = Router();

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
    const ticket = await createTicket(input);
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

ticketsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const input = updateTicketSchema.parse(req.body);
    const ticket = await updateTicket(req.params.id, input);
    res.json(ticket);
  })
);

ticketsRouter.post(
  "/:id/status",
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
    const comment = await addComment(req.params.id, input);
    res.status(201).json(comment);
  })
);
