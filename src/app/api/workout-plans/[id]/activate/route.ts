import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
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
    const plan = await WorkoutPlanModel.findOne({ _id: id, userId: session.user._id });
    if (!plan) return fail("Workout plan not found.", 404, "PLAN_NOT_FOUND");
    await WorkoutPlanModel.updateMany({ userId: session.user._id }, { isActive: false });
    plan.isActive = true;
    plan.nextPlanGenerationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await plan.save();
    return ok({ plan: toSplitDto(plan) });
  } catch (error) {
    console.error("[workout-plans:activate]", error);
    return fail("Unable to activate plan.", 500, "PLAN_ACTIVATE_FAILED");
  }
}
