import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { WorkoutSessionModel } from "@/models/WorkoutSession";
import type { SessionExerciseLike, SessionSetLike } from "@/lib/workouts/types";

export async function GET() {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const completed = await WorkoutSessionModel.find({
      userId: session.user._id,
      status: "completed",
    }).sort({ completedAt: 1 });

    const best = new Map<
      string,
      { exerciseName: string; weightKg: number; reps: number; date: string }
    >();

    completed.forEach((row) => {
      row.exercises.forEach((ex: SessionExerciseLike) => {
        ex.sets
          .filter((set: SessionSetLike) => set.completed)
          .forEach((set: SessionSetLike) => {
            const key = String(ex.exercise);
            const current = best.get(key);
            const better =
              !current ||
              set.actualWeightKg > current.weightKg ||
              (set.actualWeightKg === current.weightKg && set.actualReps > current.reps);
            if (better) {
              best.set(key, {
                exerciseName: ex.exerciseName,
                weightKg: set.actualWeightKg,
                reps: set.actualReps,
                date: (row.completedAt || row.createdAt).toISOString(),
              });
            }
          });
      });
    });

    return ok({
      items: [...best.values()]
        .sort((a, b) => b.weightKg - a.weightKg)
        .slice(0, 12),
    });
  } catch (error) {
    console.error("[workouts:records]", error);
    return fail("Unable to load records.", 500, "RECORDS_LOAD_FAILED");
  }
}
