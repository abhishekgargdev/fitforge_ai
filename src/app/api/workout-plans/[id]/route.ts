import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { toSplitDto } from "@/lib/workouts/map";
import { WorkoutPlanModel } from "@/models/WorkoutPlan";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const { id } = await context.params;
    const plan = await WorkoutPlanModel.findOne({ _id: id, userId: session.user._id });
    if (!plan) return fail("Workout plan not found.", 404, "PLAN_NOT_FOUND");
    return ok({ plan: toSplitDto(plan) });
  } catch (error) {
    console.error("[workout-plans:get]", error);
    return fail("Unable to load workout plan.", 500, "PLAN_LOAD_FAILED");
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const { id } = await context.params;
    const body = await request.json();
    const plan = await WorkoutPlanModel.findOne({ _id: id, userId: session.user._id });
    if (!plan) return fail("Workout plan not found.", 404, "PLAN_NOT_FOUND");
    if (typeof body.title === "string") plan.title = body.title;
    if (typeof body.daysPerWeek === "number") plan.daysPerWeek = body.daysPerWeek;
    await plan.save();
    return ok({ plan: toSplitDto(plan) });
  } catch (error) {
    console.error("[workout-plans:put]", error);
    return fail("Unable to update workout plan.", 500, "PLAN_UPDATE_FAILED");
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const { id } = await context.params;
    const deleted = await WorkoutPlanModel.findOneAndDelete({
      _id: id,
      userId: session.user._id,
    });
    if (!deleted) return fail("Workout plan not found.", 404, "PLAN_NOT_FOUND");
    return ok({ deleted: true });
  } catch (error) {
    console.error("[workout-plans:delete]", error);
    return fail("Unable to delete workout plan.", 500, "PLAN_DELETE_FAILED");
  }
}
