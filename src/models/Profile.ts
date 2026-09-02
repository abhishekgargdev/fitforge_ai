import { Schema, model, models } from "mongoose";

const profileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    heightCm: { type: Number, required: true },
    weightKg: { type: Number, required: true },
    bodyFatPercentage: { type: Number, required: true },
    dietPreference: {
      type: String,
      enum: ["non_vegetarian", "vegetarian", "vegan", "pescatarian", "keto", "other"],
      required: true,
    },
    mealsPerDay: { type: Number, required: true },
    foodPreferences: { type: String, default: "" },
    allergies: { type: String, default: "" },
    unitSystem: { type: String, enum: ["metric", "imperial"], default: "metric" },
    theme: { type: String, enum: ["dark", "light", "system"], default: "dark" },
    aiPersona: {
      type: String,
      enum: ["scientific", "motivational", "strict"],
      default: "scientific",
    },
    audioChimes: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "profiles" }
);

export const Profile = models.Profile ?? model("Profile", profileSchema);
