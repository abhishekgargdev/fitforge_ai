import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { generateAndSaveWorkoutPlan } from "@/lib/workouts/generate";
import { toSplitDto } from "@/lib/workouts/map";
import { WorkoutPlanModel } from "@/models/WorkoutPlan";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const { id } = await context.params;
    const existing = await WorkoutPlanModel.findOne({ _id: id, userId: session.user._id });
    if (!existing) return fail("Workout plan not found.", 404, "PLAN_NOT_FOUND");
    const inputs = existing.plannerInputs;
    if (!inputs?.goal || !inputs.daysPerWeek) {
      return fail("This plan has no planner inputs to regenerate.", 400, "MISSING_PLANNER_INPUTS");
    }
    const plan = await generateAndSaveWorkoutPlan(session.user._id, {
      goal: inputs.goal,
      daysPerWeek: inputs.daysPerWeek,
      duration: inputs.duration || 60,
      experience: inputs.experience || "intermediate",
      equipment: inputs.equipment || ["full_gym"],
      focusMuscles: inputs.focusMuscles || ["Chest", "Back"],
      preferences: inputs.preferences || "",
    });
    await WorkoutPlanModel.deleteOne({ _id: existing._id });
    return ok({ plan: toSplitDto(plan) });
  } catch (error) {
    console.error("[workout-plans:regenerate]", error);
    return fail("Unable to regenerate workout plan.", 500, "PLAN_REGENERATE_FAILED");
  }
}
