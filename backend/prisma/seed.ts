import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const users = [
  { name: "Alice Admin", email: "alice.admin@example.com", role: "ADMIN" },
  { name: "Bob Agent", email: "bob.agent@example.com", role: "AGENT" },
  { name: "Carol Agent", email: "carol.agent@example.com", role: "AGENT" },
  { name: "Dave Requester", email: "dave.requester@example.com", role: "REQUESTER" },
  { name: "Erin Requester", email: "erin.requester@example.com", role: "REQUESTER" },
];

async function main() {
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role },
      create: user,
    });
  }
  const count = await prisma.user.count();
  console.log(`Seed complete. Users in database: ${count}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
