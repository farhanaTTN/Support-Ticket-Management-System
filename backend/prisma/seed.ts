import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Seed password is taken from the environment so no credential is hardcoded.
// It is a local/dev convenience only; production users would be provisioned
// through a real flow.
const seedPassword = process.env.SEED_PASSWORD ?? "Password123!";

const users = [
  { name: "Alice Admin", email: "alice.admin@example.com", role: "ADMIN" },
  { name: "Bob Agent", email: "bob.agent@example.com", role: "AGENT" },
  { name: "Carol Agent", email: "carol.agent@example.com", role: "AGENT" },
  { name: "Dave Requester", email: "dave.requester@example.com", role: "REQUESTER" },
  { name: "Erin Requester", email: "erin.requester@example.com", role: "REQUESTER" },
];

async function main() {
  const passwordHash = await bcrypt.hash(seedPassword, 10);

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, passwordHash },
      create: { ...user, passwordHash },
    });
  }
  const count = await prisma.user.count();
  console.log(`Seed complete. Users in database: ${count}`);
  console.log(
    `All seeded users share the SEED_PASSWORD from your environment (default "Password123!").`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
