import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { generateNutritionPlan } from "@/lib/nutrition/generate";
import { aiNutritionInputSchema } from "@/lib/validation/nutrition";

export async function POST(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const parsed = aiNutritionInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input", 400, "VALIDATION_ERROR");
    }
    const plan = await generateNutritionPlan(session.user._id, parsed.data);
    return ok(plan);
  } catch (error) {
    console.error("[ai:nutrition-plan]", error);
    return fail("Unable to generate a nutrition plan right now.", 500, "AI_NUTRITION_PLAN_FAILED");
  }
}
