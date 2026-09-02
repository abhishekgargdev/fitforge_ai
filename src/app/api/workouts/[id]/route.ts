import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { updateSessionSchema } from "@/lib/validation/workouts";
import { sessionToSummary, sessionToTemplate } from "@/lib/workouts/map";
import type { SessionExerciseLike } from "@/lib/workouts/types";
import { WorkoutSessionModel } from "@/models/WorkoutSession";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const { id } = await context.params;
    const workout = await WorkoutSessionModel.findOne({
      _id: id,
      userId: session.user._id,
    });
    if (!workout) return fail("Workout not found.", 404, "WORKOUT_NOT_FOUND");
    return ok({
      session: {
        id: String(workout._id),
        status: workout.status,
        workout: sessionToTemplate(workout),
        exercises: workout.exercises,
        summary: workout.status === "completed" ? sessionToSummary(workout) : null,
      },
    });
  } catch (error) {
    console.error("[workouts:get]", error);
    return fail("Unable to load workout.", 500, "WORKOUT_LOAD_FAILED");
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
    const parsed = updateSessionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input", 400, "VALIDATION_ERROR");
    }
    const workout = await WorkoutSessionModel.findOne({
      _id: id,
      userId: session.user._id,
      status: "in_progress",
    });
    if (!workout) return fail("Active workout not found.", 404, "WORKOUT_NOT_FOUND");

    workout.exercises = workout.exercises.map((ex: SessionExerciseLike) => {
      const incoming = parsed.data.exercises.find(
        (item) => item.exerciseId === String(ex.exercise)
      );
      if (!incoming) return ex;
      const base = ex.toObject ? ex.toObject() : ex;
      return {
        ...base,
        restSeconds: incoming.restSeconds ?? ex.restSeconds,
        aiNote: incoming.aiNote ?? ex.aiNote,
        sets: incoming.sets,
      };
    });
    await workout.save();
    return ok({
      session: {
        id: String(workout._id),
        status: workout.status,
        workout: sessionToTemplate(workout),
        exercises: workout.exercises,
      },
    });
  } catch (error) {
    console.error("[workouts:put]", error);
    return fail("Unable to update workout.", 500, "WORKOUT_UPDATE_FAILED");
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
    const deleted = await WorkoutSessionModel.findOneAndDelete({
      _id: id,
      userId: session.user._id,
      status: "in_progress",
    });
    if (!deleted) return fail("Workout not found.", 404, "WORKOUT_NOT_FOUND");
    return ok({ deleted: true });
  } catch (error) {
    console.error("[workouts:delete]", error);
    return fail("Unable to delete workout.", 500, "WORKOUT_DELETE_FAILED");
  }
}
