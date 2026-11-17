import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";

process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/doctor_tracker";
process.env.FRONTEND_ORIGIN = "http://localhost:3000";
process.env.JWT_SECRET = "test-secret-that-is-at-least-32-characters-long";

let createApp: typeof import("./app.js").createApp;

beforeAll(async () => {
  ({ createApp } = await import("./app.js"));
});

describe("Phase 1 health endpoints", () => {
  it("returns API liveness", async () => {
    const response = await request(createApp()).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("ok");
  });

  it("returns a 503 readiness response when MongoDB is disconnected", async () => {
    const response = await request(createApp()).get("/api/health/ready");

    expect(response.status).toBe(503);
    expect(response.body.success).toBe(false);
  });
});
