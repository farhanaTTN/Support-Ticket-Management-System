import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import type { Express } from "express";
import { createApp } from "../src/app.js";
import { prisma } from "../src/db.js";
import type { TicketStatus } from "../src/domain/ticketStatus.js";

let app: Express;
let userId: string;

// Helper: create a ticket (always starts as OPEN) and drive it to a desired
// starting status through a sequence of valid transitions.
async function createTicketAt(status: TicketStatus): Promise<string> {
  const res = await request(app)
    .post("/api/tickets")
    .send({
      title: "State machine ticket",
      description: "Ticket used to exercise status transitions",
      priority: "MEDIUM",
      createdById: userId,
    });
  expect(res.status).toBe(201);
  const id = res.body.id as string;

  const path: Record<TicketStatus, TicketStatus[]> = {
    OPEN: [],
    IN_PROGRESS: ["IN_PROGRESS"],
    RESOLVED: ["IN_PROGRESS", "RESOLVED"],
    CLOSED: ["IN_PROGRESS", "RESOLVED", "CLOSED"],
    CANCELLED: ["CANCELLED"],
  };

  for (const step of path[status]) {
    const r = await request(app).post(`/api/tickets/${id}/status`).send({ status: step });
    expect(r.status).toBe(200);
  }
  return id;
}

beforeAll(async () => {
  app = createApp();
  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();
  const user = await prisma.user.create({
    data: { name: "Test Agent", email: "test.agent@example.com", role: "AGENT" },
  });
  userId = user.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Ticket status state machine", () => {
  const validTransitions: Array<[TicketStatus, TicketStatus]> = [
    ["OPEN", "IN_PROGRESS"],
    ["IN_PROGRESS", "RESOLVED"],
    ["RESOLVED", "CLOSED"],
    ["OPEN", "CANCELLED"],
    ["IN_PROGRESS", "CANCELLED"],
  ];

  it.each(validTransitions)(
    "allows %s -> %s",
    async (from, to) => {
      const id = await createTicketAt(from);
      const res = await request(app).post(`/api/tickets/${id}/status`).send({ status: to });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(to);
    }
  );

  const invalidTransitions: Array<[TicketStatus, TicketStatus]> = [
    ["OPEN", "RESOLVED"],
    ["OPEN", "CLOSED"],
    ["IN_PROGRESS", "CLOSED"],
    ["RESOLVED", "IN_PROGRESS"],
    ["RESOLVED", "CANCELLED"],
    ["CLOSED", "OPEN"],
    ["CLOSED", "IN_PROGRESS"],
    ["CANCELLED", "OPEN"],
    ["CANCELLED", "IN_PROGRESS"],
  ];

  it.each(invalidTransitions)(
    "rejects %s -> %s with 400",
    async (from, to) => {
      const id = await createTicketAt(from);
      const res = await request(app).post(`/api/tickets/${id}/status`).send({ status: to });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Cannot transition/i);
    }
  );

  it("rejects an unknown status value with 400", async () => {
    const id = await createTicketAt("OPEN");
    const res = await request(app)
      .post(`/api/tickets/${id}/status`)
      .send({ status: "NOT_A_STATUS" });
    expect(res.status).toBe(400);
  });
});
