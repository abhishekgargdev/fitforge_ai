import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/mongodb";
import { toSplitDto } from "@/lib/workouts/map";
import { WorkoutPlanModel } from "@/models/WorkoutPlan";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const { id } = await context.params;
    const body = await request.json();
    const { dayName, exerciseId, locked } = body as {
      dayName: string;
      exerciseId?: string;
      locked: boolean;
    };

    if (!dayName || typeof locked !== "boolean") {
      return fail("Invalid lock payload", 400, "VALIDATION_ERROR");
    }

    await connectDB();
    const plan = await WorkoutPlanModel.findOne({ _id: id, userId: session.user._id });
    if (!plan) return fail("Workout plan not found", 404, "NOT_FOUND");

    const day = plan.days.find((d: { dayName: string }) => d.dayName === dayName);
    if (!day) return fail("Day not found in plan", 404, "NOT_FOUND");

    if (exerciseId && day.workout?.exercises) {
      const ex = day.workout.exercises.find(
        (e: { exercise: { toString(): string } }) => String(e.exercise) === exerciseId
      );
      if (ex) {
        ex.locked = locked;
      }
    } else {
      day.locked = locked;
    }

    await plan.save();
    return ok({ plan: toSplitDto(plan) });
  } catch (error) {
    console.error("[workout-plans:lock]", error);
    return fail(
      error instanceof Error ? error.message : "Failed to toggle lock",
      500,
      "SERVER_ERROR"
    );
  }
}
