import { generateStructuredJson } from "@/lib/ai/orchestrator";
import { nutritionPlanSystemPrompt, nutritionPlanUserPrompt } from "@/lib/ai/prompts/nutrition-plan";
import { aiNutritionPlanSchema } from "@/lib/ai/schemas/nutrition-plan";
import { resolveFoodByName, toFoodDto } from "@/lib/nutrition/cache";
import { NutritionGoalModel } from "@/models/NutritionGoal";
import type { z } from "zod";
import type { aiNutritionInputSchema } from "@/lib/validation/nutrition";

type Input = z.infer<typeof aiNutritionInputSchema>;

export async function generateNutritionPlan(userId: unknown, input: Input) {
  const proposed = await generateStructuredJson({
    system: nutritionPlanSystemPrompt(),
    user: nutritionPlanUserPrompt({
      goal: input.goal,
      dietType: input.dietType,
      targetCalories: input.targetCalories,
      targetProteinGrams: input.targetProteinGrams,
      targetCarbsGrams: input.targetCarbsGrams,
      targetFatGrams: input.targetFatGrams,
      mealsCount: input.mealsCount,
      preferences: input.preferences || "",
      allergies: input.allergies || input.restrictions.join(", "),
      budget: input.budget || "medium",
      cuisine: input.cuisine || "",
    }),
    schema: aiNutritionPlanSchema,
  });

  const meals = [];
  for (const meal of proposed.meals) {
    const foods = [];
    for (const name of meal.foods) {
      const resolved = await resolveFoodByName(name);
      if (!resolved) continue;
      foods.push(toFoodDto(resolved));
    }
    if (foods.length === 0) continue;
    meals.push({
      mealName: meal.mealName,
      mealCategory: meal.mealCategory || "lunch",
      foods: foods.map((food) => food.name),
      resolvedFoods: foods,
      caloriesKcal: foods.reduce((sum, food) => sum + food.caloriesKcal, 0),
      proteinGrams: round1(foods.reduce((sum, food) => sum + food.proteinGrams, 0)),
      carbsGrams: round1(foods.reduce((sum, food) => sum + food.carbsGrams, 0)),
      fatGrams: round1(foods.reduce((sum, food) => sum + food.fatGrams, 0)),
      fiberGrams: round1(foods.reduce((sum, food) => sum + food.fiberGrams, 0)),
    });
  }

  if (meals.length === 0) {
    throw new Error("No proposed foods could be resolved against the food database");
  }

  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.caloriesKcal,
      protein: acc.protein + meal.proteinGrams,
      carbs: acc.carbs + meal.carbsGrams,
      fat: acc.fat + meal.fatGrams,
      fiber: acc.fiber + meal.fiberGrams,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  await NutritionGoalModel.findOneAndUpdate(
    { userId },
    {
      userId,
      targetCaloriesKcal: input.targetCalories,
      targetProteinGrams: input.targetProteinGrams ?? Math.round(totals.protein),
      targetCarbsGrams: input.targetCarbsGrams ?? Math.round(totals.carbs),
      targetFatGrams: input.targetFatGrams ?? Math.round(totals.fat),
      targetFiberGrams: Math.max(25, Math.round(totals.fiber)),
      dietType: input.dietType,
      mealsPerDay: input.mealsCount,
      preferences: input.preferences,
      allergies: input.allergies || input.restrictions.join(", "),
      budget: input.budget,
      cuisine: input.cuisine,
    },
    { upsert: true }
  );

  return {
    planTitle: proposed.planTitle,
    dailyCalories: Math.round(totals.calories),
    proteinGrams: Math.round(totals.protein),
    carbsGrams: Math.round(totals.carbs),
    fatGrams: Math.round(totals.fat),
    fiberGrams: Math.round(totals.fiber),
    meals,
    groceryList: proposed.groceryList,
  };
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}
