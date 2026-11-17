import { Schema, model } from "mongoose";

const appointmentSchema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
    date: { type: String, required: true, trim: true, index: true },
    time: { type: String, required: true, trim: true },
    reason: { type: String, required: true, trim: true, maxLength: 200 },
    status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled", index: true },
  },
  { timestamps: true },
);

appointmentSchema.index({ date: 1, time: 1 });
export const Appointment = model("Appointment", appointmentSchema);
