import { Router } from "express";
import { Appointment } from "../models/Appointment";
import { Doctor } from "../models/Doctor";
import { Patient } from "../models/Patient";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { getPagination } from "../utils/pagination";
import { appointmentCreateSchema, appointmentUpdateSchema } from "../validators/schemas";

export const appointmentRouter = Router();
appointmentRouter.use(requireAuth);

appointmentRouter.get("/", asyncHandler(async (request, response) => {
  const { page, limit, skip } = getPagination(request.query as Record<string, unknown>);
  const status = String(request.query.status ?? "").trim();
  const date = String(request.query.date ?? "").trim();
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (date) filter.date = date;
  const [items, total] = await Promise.all([
    Appointment.find(filter).populate("patient", "name phone condition").populate("doctor", "name specialization").sort({ date: 1, time: 1 }).skip(skip).limit(limit),
    Appointment.countDocuments(filter),
  ]);
  return response.json({ success: true, data: { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
}));

appointmentRouter.post("/", asyncHandler(async (request, response) => {
  const input = appointmentCreateSchema.parse(request.body);
  if (!(await Patient.exists({ _id: input.patient })) || !(await Doctor.exists({ _id: input.doctor }))) {
    return response.status(400).json({ success: false, error: { code: "INVALID_PERSON", message: "Patient or doctor not found" } });
  }
  const appointment = await Appointment.create(input);
  await appointment.populate(["patient", "doctor"]);
  return response.status(201).json({ success: true, data: appointment });
}));

appointmentRouter.patch("/:id", asyncHandler(async (request, response) => {
  const input = appointmentUpdateSchema.parse(request.body);
  if (input.patient && !(await Patient.exists({ _id: input.patient }))) {
    return response.status(400).json({ success: false, error: { code: "INVALID_PATIENT", message: "Patient not found" } });
  }
  if (input.doctor && !(await Doctor.exists({ _id: input.doctor }))) {
    return response.status(400).json({ success: false, error: { code: "INVALID_DOCTOR", message: "Doctor not found" } });
  }
  const appointment = await Appointment.findByIdAndUpdate(request.params.id, input, { new: true, runValidators: true }).populate("patient doctor");
  if (!appointment) return response.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Appointment not found" } });
  return response.json({ success: true, data: appointment });
}));

appointmentRouter.delete("/:id", asyncHandler(async (request, response) => {
  const appointment = await Appointment.findByIdAndDelete(request.params.id);
  if (!appointment) return response.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Appointment not found" } });
  return response.json({ success: true, data: { deleted: true } });
}));
