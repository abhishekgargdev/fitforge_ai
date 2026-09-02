import { z } from "zod";

export const extractedFoodItemSchema = z.object({
  foodDescription: z.string(),
  estimatedQuantity: z.string().default("1 serving"),
  meal: z.enum(["breakfast", "lunch", "dinner", "snack"]).default("snack"),
});

export const extractedFoodLogSchema = z.object({
  isFoodLog: z.boolean(),
  isCorrection: z.boolean().default(false),
  items: z.array(extractedFoodItemSchema).default([]),
});

export type ExtractedFoodLog = z.infer<typeof extractedFoodLogSchema>;

export const foodImageEstimateItemSchema = z.object({
  foodName: z.string(),
  estimatedQuantity: z.string().default("1 serving"),
  estimatedGrams: z.number().default(100),
  caloriesKcal: z.number().default(0),
  proteinGrams: z.number().default(0),
  carbsGrams: z.number().default(0),
  fatGrams: z.number().default(0),
  fiberGrams: z.number().default(0),
  mealCategory: z.enum(["breakfast", "lunch", "dinner", "snack"]).default("snack"),
});

export const foodImageEstimateSchema = z.object({
  identifiedFoods: z.array(foodImageEstimateItemSchema).default([]),
  confidenceSummary: z.string().default("Visual estimation based on image features"),
});

export type FoodImageEstimate = z.infer<typeof foodImageEstimateSchema>;
