import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    fileParallelism: false,
    globalSetup: ["tests/globalSetup.ts"],
    env: {
      // Isolated test database so tests never touch dev data.
      DATABASE_URL: "file:./test.db",
      JWT_SECRET: "test-secret",
      SEED_PASSWORD: "Password123!",
    },
    hookTimeout: 60000,
    testTimeout: 30000,
  },
});
