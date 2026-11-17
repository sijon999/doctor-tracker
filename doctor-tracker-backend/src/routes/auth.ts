import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { Admin } from "../models/Admin";
import { env } from "../config/env";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { loginSchema } from "../validators/schemas";

export const authRouter = Router();

authRouter.use("/login", rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: "draft-7", legacyHeaders: false }));

authRouter.post("/login", asyncHandler(async (request, response) => {
  const input = loginSchema.parse(request.body);
  const admin = await Admin.findOne({ email: input.email.toLowerCase() }).select("+passwordHash");
  if (!admin || !(await bcrypt.compare(input.password, admin.passwordHash))) {
    return response.status(401).json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } });
  }
  const token = jwt.sign({ role: "admin" }, env.JWT_SECRET, { subject: admin._id.toString(), expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
  response.cookie("token", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return response.json({ success: true, data: { id: admin._id, name: admin.name, email: admin.email } });
}));

authRouter.post("/logout", (_request, response) => {
  response.clearCookie("token");
  response.json({ success: true, data: { loggedOut: true } });
});

authRouter.get("/me", requireAuth, asyncHandler(async (request: AuthRequest, response) => {
  const admin = await Admin.findById(request.adminId).select("name email");
  if (!admin) return response.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Session account not found" } });
  return response.json({ success: true, data: admin });
}));
