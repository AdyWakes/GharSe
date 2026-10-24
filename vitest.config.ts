import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    globalSetup: ["tests/global-setup.ts"],
    // Integration tests share one SQLite file, so run files one at a time.
    fileParallelism: false,
    env: {
      DATABASE_URL: "file:./test.db",
      STORAGE_DIR: "storage-test",
      SESSION_SECRET: "test-secret",
      MOCK_MODE: "1",
    },
  },
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});
