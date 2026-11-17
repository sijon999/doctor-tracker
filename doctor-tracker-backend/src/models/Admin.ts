import bcrypt from "bcryptjs";
import { Schema, model, type Model } from "mongoose";

export interface IAdmin {
  name: string;
  email: string;
  passwordHash: string;
  comparePassword(password: string): Promise<boolean>;
}

const adminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true },
);

adminSchema.methods.comparePassword = function (password: string) {
  return bcrypt.compare(password, this.passwordHash);
};

export const Admin: Model<IAdmin> = model<IAdmin>("Admin", adminSchema);
