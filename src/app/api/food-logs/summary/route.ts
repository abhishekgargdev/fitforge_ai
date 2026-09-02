import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { getOrCreateNutritionGoals } from "@/lib/nutrition/goals";
import { todayDate } from "@/lib/nutrition/map";
import { FoodLogModel } from "@/models/FoodLog";

export async function GET(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const date = todayDate(new URL(request.url).searchParams.get("date") || undefined);
    const [logs, goals] = await Promise.all([
      FoodLogModel.find({ userId: session.user._id, date }),
      getOrCreateNutritionGoals(session.user._id),
    ]);
    const totals = logs.reduce(
      (acc, row) => ({
        caloriesKcal: acc.caloriesKcal + row.caloriesKcal,
        proteinGrams: acc.proteinGrams + row.proteinGrams,
        carbsGrams: acc.carbsGrams + row.carbsGrams,
        fatGrams: acc.fatGrams + row.fatGrams,
        fiberGrams: acc.fiberGrams + (row.fiberGrams || 0),
      }),
      { caloriesKcal: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0, fiberGrams: 0 }
    );
    const remainingProtein = Math.max(0, goals.targetProteinGrams - totals.proteinGrams);
    const insight =
      remainingProtein > 20
        ? `Protein is at ${Math.round(totals.proteinGrams)}g. Aim for about ${Math.round(remainingProtein)}g more from a verified source such as chicken, fish, eggs, or Greek yogurt.`
        : `Macros for ${date} are on track versus your calculated targets. Keep logging measured portions.`;

    return ok({
      date,
      totals,
      goals: {
        targetCaloriesKcal: goals.targetCaloriesKcal,
        targetProteinGrams: goals.targetProteinGrams,
        targetCarbsGrams: goals.targetCarbsGrams,
        targetFatGrams: goals.targetFatGrams,
        targetFiberGrams: goals.targetFiberGrams,
      },
      remaining: {
        caloriesKcal: Math.max(0, goals.targetCaloriesKcal - totals.caloriesKcal),
        proteinGrams: remainingProtein,
        carbsGrams: Math.max(0, goals.targetCarbsGrams - totals.carbsGrams),
        fatGrams: Math.max(0, goals.targetFatGrams - totals.fatGrams),
        fiberGrams: Math.max(0, goals.targetFiberGrams - totals.fiberGrams),
      },
      insight,
    });
  } catch (error) {
    console.error("[food-logs:summary]", error);
    return fail("Unable to load nutrition summary.", 500, "SUMMARY_LOAD_FAILED");
  }
}
