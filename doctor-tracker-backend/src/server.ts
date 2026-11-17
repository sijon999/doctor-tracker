import http from "node:http";
import { createApp } from "./app";
import { connectDatabase, disconnectDatabase } from "./config/db";
import { env } from "./config/env";
import bcrypt from "bcryptjs";
import { Admin } from "./models/Admin";

async function ensureInitialAdmin() {
  if (!env.INITIAL_ADMIN_EMAIL || !env.INITIAL_ADMIN_PASSWORD) return;
  const existing = await Admin.findOne({ email: env.INITIAL_ADMIN_EMAIL.toLowerCase() });
  if (existing) return;
  await Admin.create({
    name: "Administrator",
    email: env.INITIAL_ADMIN_EMAIL.toLowerCase(),
    passwordHash: await bcrypt.hash(env.INITIAL_ADMIN_PASSWORD, 12),
  });
  console.log("Initial admin account created");
}

async function start() {
  await connectDatabase();
  await ensureInitialAdmin();
  const app = createApp();
  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    console.log(`Doctor Tracker API listening on port ${env.PORT}`);
  });

  const shutdown = (signal: string) => {
    console.log(`Received ${signal}; shutting down gracefully`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
