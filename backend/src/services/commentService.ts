import { prisma } from "../db.js";
import { badRequest, notFound } from "../errors.js";
import type { CreateCommentInput } from "../validators/ticketSchemas.js";

export async function addComment(ticketId: string, input: CreateCommentInput) {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    throw notFound(`Ticket ${ticketId} not found`);
  }

  const author = await prisma.user.findUnique({
    where: { id: input.createdById },
  });
  if (!author) {
    throw badRequest("createdById does not reference an existing user");
  }

  return prisma.comment.create({
    data: {
      ticketId,
      message: input.message,
      createdById: input.createdById,
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true, role: true } },
    },
  });
}
