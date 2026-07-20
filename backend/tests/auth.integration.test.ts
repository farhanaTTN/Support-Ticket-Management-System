import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import type { Express } from "express";
import { createApp } from "../src/app.js";
import { prisma } from "../src/db.js";

let app: Express;
let agentToken: string;
let requesterToken: string;
let ticketId: string;

async function loginToken(email: string, password: string): Promise<string> {
  const res = await request(app).post("/api/auth/login").send({ email, password });
  expect(res.status).toBe(200);
  return res.body.token as string;
}

beforeAll(async () => {
  app = createApp();
  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);
  await prisma.user.createMany({
    data: [
      { name: "Agent", email: "agent@example.com", role: "AGENT", passwordHash },
      { name: "Requester", email: "req@example.com", role: "REQUESTER", passwordHash },
    ],
  });

  agentToken = await loginToken("agent@example.com", "Password123!");
  requesterToken = await loginToken("req@example.com", "Password123!");

  const created = await request(app)
    .post("/api/tickets")
    .set("Authorization", `Bearer ${requesterToken}`)
    .send({ title: "Requester ticket", description: "Made by requester", priority: "LOW" });
  expect(created.status).toBe(201);
  ticketId = created.body.id as string;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Authentication", () => {
  it("rejects login with wrong password (401)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "agent@example.com", password: "wrong" });
    expect(res.status).toBe(401);
  });

  it("does not reveal whether an email exists", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "whatever" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid email or password");
  });

  it("returns the current user from /api/auth/me with a valid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${agentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("agent@example.com");
    expect(res.body).not.toHaveProperty("passwordHash");
  });
});

describe("Protected routes", () => {
  it("rejects unauthenticated ticket listing (401)", async () => {
    const res = await request(app).get("/api/tickets");
    expect(res.status).toBe(401);
  });

  it("rejects an invalid token (401)", async () => {
    const res = await request(app)
      .get("/api/tickets")
      .set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });

  it("allows authenticated ticket listing (200)", async () => {
    const res = await request(app)
      .get("/api/tickets")
      .set("Authorization", `Bearer ${requesterToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("Authorization by role", () => {
  it("forbids a REQUESTER from changing status (403)", async () => {
    const res = await request(app)
      .post(`/api/tickets/${ticketId}/status`)
      .set("Authorization", `Bearer ${requesterToken}`)
      .send({ status: "IN_PROGRESS" });
    expect(res.status).toBe(403);
  });

  it("forbids a REQUESTER from updating a ticket (403)", async () => {
    const res = await request(app)
      .patch(`/api/tickets/${ticketId}`)
      .set("Authorization", `Bearer ${requesterToken}`)
      .send({ priority: "HIGH" });
    expect(res.status).toBe(403);
  });

  it("allows an AGENT to change status (200)", async () => {
    const res = await request(app)
      .post(`/api/tickets/${ticketId}/status`)
      .set("Authorization", `Bearer ${agentToken}`)
      .send({ status: "IN_PROGRESS" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("IN_PROGRESS");
  });

  it("derives comment author from the token, not the body", async () => {
    const res = await request(app)
      .post(`/api/tickets/${ticketId}/comments`)
      .set("Authorization", `Bearer ${agentToken}`)
      .send({ message: "Working on it" });
    expect(res.status).toBe(201);
    expect(res.body.createdBy.email).toBe("agent@example.com");
  });
});
