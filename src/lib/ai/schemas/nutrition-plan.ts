import { z } from "zod";

/** AI proposes food names only. Calories/macros are resolved from foodItems / USDA / OFF. */
export const nutritionPlanSchema = z.object({
  planTitle: z.string().min(1).max(120),
  meals: z
    .array(
      z.object({
        mealName: z.string().min(1),
        mealCategory: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
        foods: z.array(z.string().min(1)).min(1),
      })
    )
    .min(3)
    .max(6),
  groceryList: z.array(z.string()).optional().default([]),
});

export const aiNutritionPlanSchema = nutritionPlanSchema;
export type NutritionPlan = z.infer<typeof nutritionPlanSchema>;
export type AiNutritionPlan = NutritionPlan;
