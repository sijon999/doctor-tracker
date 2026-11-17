import { Schema, model } from "mongoose";

const patientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0, max: 150 },
    gender: { type: String, enum: ["male", "female", "other"], trim: true },
    condition: { type: String, required: true, trim: true, index: true },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
  },
  { timestamps: true },
);

patientSchema.index({ createdAt: -1 });
patientSchema.index({ doctor: 1, createdAt: -1 });
export const Patient = model("Patient", patientSchema);
