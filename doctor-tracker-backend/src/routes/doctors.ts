import { Router } from "express";
import { Doctor } from "../models/Doctor";
import { Patient } from "../models/Patient";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { getPagination } from "../utils/pagination";
import { doctorCreateSchema, doctorUpdateSchema } from "../validators/schemas";

export const doctorRouter = Router();
doctorRouter.use(requireAuth);

doctorRouter.get("/", asyncHandler(async (request, response) => {
  const { page, limit, skip } = getPagination(request.query as Record<string, unknown>);
  const search = String(request.query.search ?? "").trim();
  const from = request.query.from ? new Date(String(request.query.from)) : undefined;
  const to = request.query.to ? new Date(String(request.query.to)) : undefined;
  const filter: Record<string, unknown> = {};
  if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { specialization: { $regex: search, $options: "i" } }, { hospital: { $regex: search, $options: "i" } }];
  if (from || to) filter.createdAt = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) };
  const [items, total] = await Promise.all([
    Doctor.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Doctor.countDocuments(filter),
  ]);
  return response.json({ success: true, data: { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
}));

doctorRouter.post("/", asyncHandler(async (request, response) => {
  const input = doctorCreateSchema.parse(request.body);
  const doctor = await Doctor.create(input);
  return response.status(201).json({ success: true, data: doctor });
}));

doctorRouter.get("/:id", asyncHandler(async (request, response) => {
  const doctor = await Doctor.findById(request.params.id);
  if (!doctor) return response.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Doctor not found" } });
  const patients = await Patient.find({ doctor: doctor._id }).sort({ createdAt: -1 });
  return response.json({ success: true, data: { doctor, patients } });
}));

doctorRouter.patch("/:id", asyncHandler(async (request, response) => {
  const input = doctorUpdateSchema.parse(request.body);
  const doctor = await Doctor.findByIdAndUpdate(request.params.id, input, { new: true, runValidators: true });
  if (!doctor) return response.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Doctor not found" } });
  return response.json({ success: true, data: doctor });
}));

doctorRouter.delete("/:id", asyncHandler(async (request, response) => {
  const doctor = await Doctor.findById(request.params.id);
  if (!doctor) return response.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Doctor not found" } });
  await Patient.deleteMany({ doctor: doctor._id });
  await doctor.deleteOne();
  return response.json({ success: true, data: { deleted: true } });
}));
