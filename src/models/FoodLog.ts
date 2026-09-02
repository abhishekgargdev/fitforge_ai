import { Schema, model, models } from "mongoose";

const foodLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    foodItemId: { type: Schema.Types.ObjectId, ref: "FoodItem" },
    name: { type: String, required: true },
    serving: { type: String, default: "1 serving" },
    mealCategory: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
      index: true,
    },
    grams: { type: Number, default: 0 },
    caloriesKcal: { type: Number, required: true },
    proteinGrams: { type: Number, required: true },
    carbsGrams: { type: Number, required: true },
    fatGrams: { type: Number, required: true },
    fiberGrams: { type: Number, default: 0 },
    loggedAt: { type: Date, default: Date.now },
    date: { type: String, required: true, index: true },
  },
  { timestamps: true, collection: "foodLogs" }
);

foodLogSchema.index({ userId: 1, date: 1 });

export const FoodLogModel = models.FoodLog ?? model("FoodLog", foodLogSchema);
