import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const prismaBin = resolve(here, "../node_modules/prisma/build/index.js");

// Create/reset the isolated SQLite test database schema before the suite runs.
// Invokes the local Prisma binary via node directly (portable across shells).
export default function setup() {
  execFileSync(
    process.execPath,
    [prismaBin, "db", "push", "--skip-generate", "--force-reset"],
    {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: "file:./test.db" },
    }
  );
}
