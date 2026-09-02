import { Schema, model, models } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    onboardingComplete: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, collection: "users" }
);

export const User = models.User ?? model("User", userSchema);
