import { Schema, model, models } from "mongoose";

const exerciseSchema = new Schema(
  {
    exerciseId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    bodyParts: { type: [String], default: [], index: true },
    targetMuscles: { type: [String], default: [], index: true },
    primaryMuscles: { type: [String], default: [] },
    secondaryMuscles: { type: [String], default: [] },
    equipments: { type: [String], default: [], index: true },
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
    source: {
      type: String,
      enum: ["catalog", "user"],
      default: "catalog",
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: false },
    cloudinaryPublicId: { type: String, required: false },
  },
  { timestamps: true, collection: "exercises" }
);

exerciseSchema.index({ name: "text", targetMuscles: "text", bodyParts: "text", equipments: "text" });

export const ExerciseModel = models.Exercise ?? model("Exercise", exerciseSchema);
