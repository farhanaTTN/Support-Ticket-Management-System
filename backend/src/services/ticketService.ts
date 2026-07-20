import { prisma } from "../db.js";
import { badRequest, notFound } from "../errors.js";
import {
  canTransition,
  isTicketStatus,
  nextStatuses,
  type TicketStatus,
} from "../domain/ticketStatus.js";
import type {
  CreateTicketInput,
  UpdateTicketInput,
} from "../validators/ticketSchemas.js";

const ticketInclude = {
  createdBy: { select: { id: true, name: true, email: true, role: true } },
  assignedTo: { select: { id: true, name: true, email: true, role: true } },
} as const;

async function assertUserExists(userId: string, field: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw badRequest(`${field} does not reference an existing user`);
  }
}

export async function createTicket(input: CreateTicketInput, createdById: string) {
  await assertUserExists(createdById, "createdById");
  if (input.assignedToId) {
    await assertUserExists(input.assignedToId, "assignedToId");
  }

  return prisma.ticket.create({
    data: {
      title: input.title,
      description: input.description,
      priority: input.priority,
      status: "OPEN",
      createdById,
      assignedToId: input.assignedToId ?? null,
    },
    include: ticketInclude,
  });
}

export async function listTickets(params: { q?: string; status?: TicketStatus }) {
  const { q, status } = params;
  return prisma.ticket.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { description: { contains: q } },
            ],
          }
        : {}),
    },
    include: ticketInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getTicket(id: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      ...ticketInclude,
      comments: {
        include: {
          createdBy: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!ticket) {
    throw notFound(`Ticket ${id} not found`);
  }
  return {
    ...ticket,
    allowedNextStatuses: nextStatuses(ticket.status as TicketStatus),
  };
}

export async function updateTicket(id: string, input: UpdateTicketInput) {
  const existing = await prisma.ticket.findUnique({ where: { id } });
  if (!existing) {
    throw notFound(`Ticket ${id} not found`);
  }
  if (input.assignedToId) {
    await assertUserExists(input.assignedToId, "assignedToId");
  }

  return prisma.ticket.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.assignedToId !== undefined
        ? { assignedToId: input.assignedToId }
        : {}),
    },
    include: ticketInclude,
  });
}

export async function changeStatus(id: string, target: TicketStatus) {
  const existing = await prisma.ticket.findUnique({ where: { id } });
  if (!existing) {
    throw notFound(`Ticket ${id} not found`);
  }

  const current = existing.status;
  if (!isTicketStatus(current)) {
    throw badRequest(`Ticket has an unknown current status: ${current}`);
  }

  if (current === target) {
    throw badRequest(`Ticket is already ${target}`);
  }

  if (!canTransition(current, target)) {
    throw badRequest(
      `Cannot transition from ${current} to ${target}`,
      { from: current, to: target, allowed: nextStatuses(current) }
    );
  }

  return prisma.ticket.update({
    where: { id },
    data: { status: target },
    include: ticketInclude,
  });
}
