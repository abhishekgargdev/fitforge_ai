import { Schema, model, models } from "mongoose";

const foodItemSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    servingSize: { type: String, default: "100 g" },
    servingWeightGrams: { type: Number, required: true },
    caloriesKcal: { type: Number, required: true },
    proteinGrams: { type: Number, required: true },
    carbsGrams: { type: Number, required: true },
    fatGrams: { type: Number, required: true },
    fiberGrams: { type: Number, default: 0 },
    category: {
      type: String,
      enum: ["Protein", "Carb", "Fat", "Produce", "Snack", "Dairy"],
      default: "Protein",
    },
    source: {
      type: String,
      enum: ["usda", "open_food_facts", "custom"],
      required: true,
      index: true,
    },
    usdaFdcId: { type: String, index: true, sparse: true, unique: true },
    barcode: { type: String, index: true, sparse: true, unique: true },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "foodItems" }
);

foodItemSchema.index({ name: "text" });

export const FoodItemModel = models.FoodItem ?? model("FoodItem", foodItemSchema);
