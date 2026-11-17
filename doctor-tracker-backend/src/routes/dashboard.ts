import { Router } from "express";
import { Doctor } from "../models/Doctor";
import { Patient } from "../models/Patient";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get("/stats", asyncHandler(async (_request, response) => {
  const [totalDoctors, totalPatients, newPatients] = await Promise.all([
    Doctor.countDocuments(),
    Patient.countDocuments(),
    Patient.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
  ]);
  return response.json({ success: true, data: { totalDoctors, totalPatients, newPatients } });
}));

dashboardRouter.get("/patients-over-time", asyncHandler(async (request, response) => {
  const months = Math.min(24, Math.max(1, Number(request.query.months) || 12));
  const from = new Date();
  from.setMonth(from.getMonth() - months);
  const items = await Patient.aggregate([
    { $match: { createdAt: { $gte: from } } },
    { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);
  return response.json({ success: true, data: items.map((item) => ({ date: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`, count: item.count })) });
}));

dashboardRouter.get("/patients-per-doctor", asyncHandler(async (_request, response) => {
  const items = await Patient.aggregate([
    { $group: { _id: "$doctor", count: { $sum: 1 } } },
    { $lookup: { from: "doctors", localField: "_id", foreignField: "_id", as: "doctor" } },
    { $unwind: "$doctor" },
    { $project: { _id: 0, doctorId: "$doctor._id", name: "$doctor.name", count: 1 } },
    { $sort: { count: -1 } },
  ]);
  return response.json({ success: true, data: items });
}));
