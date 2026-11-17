import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { createApp } from "../src/app";
import { env } from "../src/config/env";
import { Admin } from "../src/models/Admin";

const app = createApp();

let initialization: Promise<void> | undefined;

async function initializeDatabase(): Promise<void> {
  if (!initialization) {
    initialization = (async () => {
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(env.MONGODB_URI);
      }

      if (env.INITIAL_ADMIN_EMAIL && env.INITIAL_ADMIN_PASSWORD) {
        const email = env.INITIAL_ADMIN_EMAIL.toLowerCase();
        const existing = await Admin.findOne({ email });
        if (!existing) {
          await Admin.create({
            name: "Administrator",
            email,
            passwordHash: await bcrypt.hash(env.INITIAL_ADMIN_PASSWORD, 12),
          });
        }
      }
    })();
  }

  await initialization;
}

export default async function handler(request: any, response: any) {
  await initializeDatabase();
  return app(request, response);
}
