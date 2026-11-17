import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
});

export const doctorCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  specialization: z.string().trim().min(2).max(100),
  hospital: z.string().trim().min(2).max(150),
  phone: z.string().trim().min(6).max(30),
  email: z.string().email().toLowerCase(),
});

export const doctorUpdateSchema = doctorCreateSchema.partial();

export const patientCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email().toLowerCase().optional().or(z.literal("")),
  phone: z.string().trim().min(6).max(30),
  age: z.coerce.number().int().min(0).max(150),
  gender: z.enum(["male", "female", "other"]).optional(),
  condition: z.string().trim().min(2).max(150),
  doctor: z.string().regex(/^[a-f\d]{24}$/i),
});

export const patientUpdateSchema = patientCreateSchema.partial();
