import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/mongodb";
import { WorkoutPlanModel } from "@/models/WorkoutPlan";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; dayId: string }> }
) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const { id, dayId } = await context.params;
    if (!id || !dayId) return fail("Plan ID and Day ID are required.", 400, "VALIDATION_ERROR");

    const body = await request.json();
    const { skipped = false, reason = "" } = body ?? {};

    await connectDB();
    const plan = await WorkoutPlanModel.findOne({ _id: id, userId: session.user._id });
    if (!plan) return fail("Workout plan not found.", 404, "PLAN_NOT_FOUND");

    const day = plan.days.find((item: any) =>
      item.dayName?.toLowerCase() === dayId.toLowerCase() || String(item._id) === dayId
    );
    if (!day) return fail("Workout day not found.", 404, "DAY_NOT_FOUND");

    day.skipped = Boolean(skipped);
    day.skipReason = skipped ? String(reason || "Skipped by user").trim() || "Skipped by user" : "";
    await plan.save();

    return ok({
      success: true,
      day: {
        dayName: day.dayName,
        skipped: day.skipped,
        skipReason: day.skipReason,
      },
    });
  } catch (error) {
    console.error("[workout-plans:skip-day]", error);
    return fail("Unable to update workout day status.", 500, "UPDATE_DAY_STATUS_FAILED");
  }
}
