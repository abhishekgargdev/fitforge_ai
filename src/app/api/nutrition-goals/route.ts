import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { nutritionGoalUpdateSchema } from "@/lib/validation/nutrition";
import { getOrCreateNutritionGoals } from "@/lib/nutrition/goals";

function toGoalDto(doc: {
  targetCaloriesKcal: number;
  targetProteinGrams: number;
  targetCarbsGrams: number;
  targetFatGrams: number;
  targetFiberGrams: number;
  dietType?: string;
  mealsPerDay?: number;
  preferences?: string;
  allergies?: string;
  budget?: string;
  cuisine?: string;
  waterTargetMl?: number;
}) {
  return {
    targetCaloriesKcal: doc.targetCaloriesKcal,
    targetProteinGrams: doc.targetProteinGrams,
    targetCarbsGrams: doc.targetCarbsGrams,
    targetFatGrams: doc.targetFatGrams,
    targetFiberGrams: doc.targetFiberGrams,
    dietType: doc.dietType,
    mealsPerDay: doc.mealsPerDay,
    preferences: doc.preferences,
    allergies: doc.allergies,
    budget: doc.budget,
    cuisine: doc.cuisine,
    waterTargetMl: doc.waterTargetMl,
  };
}

export async function GET() {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const goals = await getOrCreateNutritionGoals(session.user._id);
    return ok({ goals: toGoalDto(goals) });
  } catch (error) {
    console.error("[nutrition-goals:get]", error);
    return fail("Unable to load nutrition goals.", 500, "GOALS_LOAD_FAILED");
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const parsed = nutritionGoalUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input", 400, "VALIDATION_ERROR");
    }
    const goals = await getOrCreateNutritionGoals(session.user._id);
    Object.assign(goals, parsed.data);
    await goals.save();
    return ok({ goals: toGoalDto(goals) });
  } catch (error) {
    console.error("[nutrition-goals:put]", error);
    return fail("Unable to save nutrition goals.", 500, "GOALS_SAVE_FAILED");
  }
}
