import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth";
import { doctorRouter } from "./routes/doctors";
import { patientRouter } from "./routes/patients";
import { dashboardRouter } from "./routes/dashboard";
import { appointmentRouter } from "./routes/appointments";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(pinoHttp());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 100,
      standardHeaders: "draft-7",
      legacyHeaders: false,
    }),
  );

  app.get("/api/health", (_request, response) => {
    response.json({
      success: true,
      data: { status: "ok", timestamp: new Date().toISOString() },
    });
  });

  app.get("/api/health/ready", (_request, response) => {
    const ready = mongoose.connection.readyState === 1;
    response.status(ready ? 200 : 503).json({
      success: ready,
      data: { status: ready ? "ready" : "not_ready", database: ready ? "connected" : "disconnected" },
    });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/doctors", doctorRouter);
  app.use("/api/patients", patientRouter);
  app.use("/api/appointments", appointmentRouter);
  app.use("/api/dashboard", dashboardRouter);

  app.use((_request, response) => {
    response.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Route not found" },
    });
  });

  app.use(errorHandler);

  return app;
}
