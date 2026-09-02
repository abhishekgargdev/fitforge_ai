import { Schema, model, models } from "mongoose";

const fitnessGoalSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    fitnessGoal: {
      type: String,
      enum: ["lose_fat", "build_muscle", "maintain", "improve_fitness", "strength", "general_health"],
      required: true,
    },
    targetWeightKg: { type: Number, required: true },
    focusMuscles: { type: [String], default: [] },
    experienceLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    trainingDaysPerWeek: { type: Number, required: true },
    trainingDays: {
      type: [String],
      default: ["mon", "wed", "fri", "sat"],
    },
    workoutDurationMinutes: { type: Number, required: true },
    availableEquipment: {
      type: [String],
      enum: [
        "full_gym",
        "dumbbells",
        "barbell",
        "machines",
        "resistance_bands",
        "bodyweight",
        "home_gym",
      ],
      default: [],
    },
  },
  { timestamps: true, collection: "fitnessGoals" }
);

export const FitnessGoalModel = models.FitnessGoal ?? model("FitnessGoal", fitnessGoalSchema);
