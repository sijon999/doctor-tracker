import { Router } from "express";
import { Doctor } from "../models/Doctor";
import { Patient } from "../models/Patient";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { getPagination } from "../utils/pagination";
import { patientCreateSchema, patientUpdateSchema } from "../validators/schemas";

export const patientRouter = Router();
patientRouter.use(requireAuth);

patientRouter.get("/", asyncHandler(async (request, response) => {
  const { page, limit, skip } = getPagination(request.query as Record<string, unknown>);
  const search = String(request.query.search ?? "").trim();
  const condition = String(request.query.condition ?? "").trim();
  const doctor = String(request.query.doctor ?? "").trim();
  const filter: Record<string, unknown> = {};
  if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { phone: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];
  if (condition) filter.condition = condition;
  if (doctor) filter.doctor = doctor;
  const from = request.query.from ? new Date(String(request.query.from)) : undefined;
  const to = request.query.to ? new Date(String(request.query.to)) : undefined;
  if (from || to) filter.createdAt = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) };
  const [items, total] = await Promise.all([
    Patient.find(filter).populate("doctor", "name specialization hospital").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Patient.countDocuments(filter),
  ]);
  return response.json({ success: true, data: { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
}));

patientRouter.post("/", asyncHandler(async (request, response) => {
  const input = patientCreateSchema.parse(request.body);
  if (!(await Doctor.exists({ _id: input.doctor }))) {
    return response.status(400).json({ success: false, error: { code: "INVALID_DOCTOR", message: "Doctor not found" } });
  }
  if (input.email === "") delete (input as Partial<typeof input>).email;
  const patient = await Patient.create(input);
  await patient.populate("doctor", "name specialization hospital");
  return response.status(201).json({ success: true, data: patient });
}));

patientRouter.get("/:id", asyncHandler(async (request, response) => {
  const patient = await Patient.findById(request.params.id).populate("doctor", "name specialization hospital");
  if (!patient) return response.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Patient not found" } });
  return response.json({ success: true, data: patient });
}));

patientRouter.patch("/:id", asyncHandler(async (request, response) => {
  const input = patientUpdateSchema.parse(request.body);
  if (input.doctor && !(await Doctor.exists({ _id: input.doctor }))) {
    return response.status(400).json({ success: false, error: { code: "INVALID_DOCTOR", message: "Doctor not found" } });
  }
  if (input.email === "") delete (input as Partial<typeof input>).email;
  const patient = await Patient.findByIdAndUpdate(request.params.id, input, { new: true, runValidators: true }).populate("doctor", "name specialization hospital");
  if (!patient) return response.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Patient not found" } });
  return response.json({ success: true, data: patient });
}));

patientRouter.delete("/:id", asyncHandler(async (request, response) => {
  const patient = await Patient.findByIdAndDelete(request.params.id);
  if (!patient) return response.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Patient not found" } });
  return response.json({ success: true, data: { deleted: true } });
}));
