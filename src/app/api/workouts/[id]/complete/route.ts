import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import {
  estimatedWorkoutCalories,
  progressDelta,
  workoutVolume,
} from "@/lib/calculations";
import { updateSessionSchema } from "@/lib/validation/workouts";
import { sessionToSummary } from "@/lib/workouts/map";
import type { SessionExerciseLike, SessionSetLike } from "@/lib/workouts/types";
import { Profile } from "@/models/Profile";
import { WorkoutSessionModel } from "@/models/WorkoutSession";
import { BodyMeasurement } from "@/models/BodyMeasurement";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const { id } = await context.params;
    const json = await request.json().catch(() => ({}));
    const parsed = updateSessionSchema.partial().safeParse(json);

    const workout = await WorkoutSessionModel.findOne({
      _id: id,
      userId: session.user._id,
    });
    if (!workout) return fail("Workout not found.", 404, "WORKOUT_NOT_FOUND");
    if (workout.status === "completed") {
      return ok({ summary: sessionToSummary(workout) });
    }

    if (parsed.success && parsed.data.exercises) {
      workout.exercises = workout.exercises.map((ex: SessionExerciseLike) => {
      const incoming = parsed.data.exercises?.find(
        (item) => item.exerciseId === String(ex.exercise)
      );
      if (!incoming) return ex;
      const base = ex.toObject ? ex.toObject() : ex;
      return { ...base, sets: incoming.sets };
    });
    }

    const completedSets = workout.exercises.flatMap((ex: SessionExerciseLike) =>
      ex.sets.filter((set: SessionSetLike) => set.completed).map((set: SessionSetLike) => ({
        exerciseName: ex.exerciseName,
        exerciseId: String(ex.exercise),
        weightKg: set.actualWeightKg,
        reps: set.actualReps,
      }))
    );

    const totalVolumeKg = workoutVolume(
      completedSets.map((set: { weightKg: number; reps: number }) => ({
        weightKg: set.weightKg,
        reps: set.reps,
      }))
    );
    const durationMinutes =
      parsed.success && parsed.data.durationMinutes
        ? parsed.data.durationMinutes
        : Math.max(1, Math.round((Date.now() - new Date(workout.startedAt).getTime()) / 60000));

    const profile = await Profile.findOne({ userId: session.user._id });
    const previous = await WorkoutSessionModel.findOne({
      userId: session.user._id,
      status: "completed",
      _id: { $ne: workout._id },
    }).sort({ completedAt: -1 });

    const history = await WorkoutSessionModel.find({
      userId: session.user._id,
      status: "completed",
    });
    const best = new Map<string, number>();
    history.forEach((row) => {
      row.exercises.forEach((ex: SessionExerciseLike) => {
        const key = String(ex.exercise);
        const top = ex.sets.reduce(
          (max: number, set: SessionSetLike) =>
            set.completed ? Math.max(max, set.actualWeightKg) : max,
          0
        );
        best.set(key, Math.max(best.get(key) || 0, top));
      });
    });

    const personalRecords = completedSets
      .filter((set: { weightKg: number; exerciseId: string }) => set.weightKg > (best.get(set.exerciseId) || 0))
      .map(
        (set: { exerciseName: string; weightKg: number; reps: number }) =>
          `${set.exerciseName} (${set.weightKg}kg × ${set.reps} reps)`
      );

    workout.status = "completed";
    workout.completedAt = new Date();
    workout.durationMinutes = durationMinutes;
    workout.totalVolumeKg = totalVolumeKg;
    workout.totalSets = completedSets.length;
    workout.totalExercises = workout.exercises.length;
    workout.caloriesBurnedEstimate = estimatedWorkoutCalories(
      durationMinutes,
      profile?.weightKg || 75
    );
    workout.personalRecords = [...new Set(personalRecords)];
    workout.volumeChangeVsPreviousPercentage = progressDelta(
      totalVolumeKg,
      previous?.totalVolumeKg || 0
    );
    const delta = workout.volumeChangeVsPreviousPercentage;
    workout.aiSummary =
      delta > 0
        ? `Strong session. Volume was ${delta}% above your last workout. Keep rest honest and add load when all target reps are clean.`
        : `Session complete. Volume was ${Math.abs(delta)}% under your last workout — recover well and repeat the same movements next time.`;
    if (!previous) {
      workout.aiSummary =
        "First logged session is in. Treat these numbers as your baseline for progressive overload.";
    }
    await workout.save();

    if (parsed.success && parsed.data.endWeightKg) {
      await BodyMeasurement.create({
        userId: session.user._id,
        date: new Date(),
        weightKg: parsed.data.endWeightKg,
        origin: "WORKOUT_CHECKIN",
      });
    }

    return ok({ summary: sessionToSummary(workout) });
  } catch (error) {
    console.error("[workouts:complete]", error);
    return fail("Unable to complete workout.", 500, "WORKOUT_COMPLETE_FAILED");
  }
}
