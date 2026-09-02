import { Schema, model, models } from "mongoose";

const nutritionGoalSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    targetCaloriesKcal: { type: Number, required: true },
    targetProteinGrams: { type: Number, required: true },
    targetCarbsGrams: { type: Number, required: true },
    targetFatGrams: { type: Number, required: true },
    targetFiberGrams: { type: Number, default: 30 },
    dietType: {
      type: String,
      enum: ["balanced", "high_protein", "low_carb", "keto", "vegetarian", "vegan", "mediterranean"],
      default: "high_protein",
    },
    mealsPerDay: { type: Number, default: 4 },
    preferences: { type: String, default: "" },
    allergies: { type: String, default: "" },
    budget: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    cuisine: { type: String, default: "" },
    waterTargetMl: { type: Number, default: 3500 },
  },
  { timestamps: true, collection: "nutritionGoals" }
);

export const NutritionGoalModel =
  models.NutritionGoal ?? model("NutritionGoal", nutritionGoalSchema);
