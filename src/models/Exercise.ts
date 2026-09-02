import { Schema, model, models } from "mongoose";

const exerciseSchema = new Schema(
  {
    exerciseId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    bodyPart: { type: String, required: true, index: true },
    target: { type: String, required: true, index: true },
    primaryMuscles: { type: [String], default: [] },
    secondaryMuscles: { type: [String], default: [] },
    equipment: { type: String, required: true, index: true },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
      index: true,
    },
    exerciseType: {
      type: String,
      enum: ["Strength", "Hypertrophy", "Cardio", "Mobility"],
      default: "Strength",
    },
    gifUrl: { type: String, required: true },
    instructions: { type: [String], default: [] },
    commonMistakes: { type: [String], default: [] },
    tips: { type: [String], default: [] },
  },
  { timestamps: true, collection: "exercises" }
);

exerciseSchema.index({ name: "text", target: "text", bodyPart: "text" });

export const ExerciseModel = models.Exercise ?? model("Exercise", exerciseSchema);
