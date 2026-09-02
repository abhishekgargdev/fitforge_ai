import { z } from "zod";

export const foodLogCreateSchema = z.object({
  foodId: z.string().optional(),
  name: z.string().trim().min(1).max(120),
  serving: z.string().max(80).optional().default("1 serving"),
  mealCategory: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  servings: z.number().min(0.1).max(10).optional().default(1),
  grams: z.number().min(0).optional(),
  caloriesKcal: z.number().min(0).optional(),
  proteinGrams: z.number().min(0).optional(),
  carbsGrams: z.number().min(0).optional(),
  fatGrams: z.number().min(0).optional(),
  fiberGrams: z.number().min(0).optional(),
  date: z.string().optional(),
});

export const foodLogUpdateSchema = foodLogCreateSchema.partial().extend({
  mealCategory: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
});

export const nutritionGoalUpdateSchema = z
  .object({
    targetCaloriesKcal: z.number().int().min(1200).max(5000).optional(),
    targetProteinGrams: z.number().min(40).max(400).optional(),
    targetCarbsGrams: z.number().min(20).max(800).optional(),
    targetFatGrams: z.number().min(20).max(300).optional(),
    targetFiberGrams: z.number().min(10).max(80).optional(),
    dietType: z
      .enum(["balanced", "high_protein", "low_carb", "keto", "vegetarian", "vegan", "mediterranean"])
      .optional(),
    mealsPerDay: z.number().int().min(2).max(8).optional(),
    preferences: z.string().max(400).optional(),
    allergies: z.string().max(300).optional(),
    budget: z.enum(["low", "medium", "high"]).optional(),
    cuisine: z.string().max(80).optional(),
    waterTargetMl: z.number().int().min(500).max(8000).optional(),
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: "Provide at least one nutrition goal field.",
  });

export const aiNutritionInputSchema = z.object({
  goal: z.string().min(1),
  dietType: z.enum([
    "balanced",
    "high_protein",
    "low_carb",
    "keto",
    "vegetarian",
    "vegan",
    "mediterranean",
  ]),
  targetCalories: z.number().int().min(1200).max(5000),
  targetProteinGrams: z.number().min(40).max(400).optional(),
  targetCarbsGrams: z.number().min(20).max(800).optional(),
  targetFatGrams: z.number().min(20).max(300).optional(),
  mealsCount: z.number().int().min(3).max(6),
  restrictions: z.array(z.string()).optional().default([]),
  preferences: z.string().max(400).optional().default(""),
  allergies: z.string().max(300).optional().default(""),
  budget: z.enum(["low", "medium", "high"]).optional().default("medium"),
  cuisine: z.string().max(80).optional().default(""),
});
