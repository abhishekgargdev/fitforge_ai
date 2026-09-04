import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { paginationQuery } from "@/lib/validation/base";
import { startWorkoutSchema } from "@/lib/validation/workouts";
import { sessionToSummary, sessionToTemplate } from "@/lib/workouts/map";
import { BodyMeasurement } from "@/models/BodyMeasurement";
import { WorkoutPlanModel } from "@/models/WorkoutPlan";
import { WorkoutSessionModel } from "@/models/WorkoutSession";
import type { SessionExerciseLike, SessionSetLike } from "@/lib/workouts/types";

export async function GET(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const url = new URL(request.url);
    const parsed = paginationQuery.safeParse({
      page: url.searchParams.get("page") ?? "1",
      limit: url.searchParams.get("limit") ?? "20",
    });
    if (!parsed.success) {
      return fail("Invalid query", 400, "VALIDATION_ERROR");
    }
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const filter: Record<string, unknown> = { userId: session.user._id };
    if (from || to) {
      filter.startedAt = {
        ...(from ? { $gte: new Date(from) } : {}),
        ...(to ? { $lte: new Date(to) } : {}),
      };
    }
    const { page, limit } = parsed.data;
    const [rows, total] = await Promise.all([
      WorkoutSessionModel.find(filter)
        .sort({ startedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      WorkoutSessionModel.countDocuments(filter),
    ]);
    return ok({
      items: rows.map(sessionToSummary),
      page,
      limit,
      total,
    });
  } catch (error) {
    console.error("[workouts:list]", error);
    return fail("Unable to load workouts.", 500, "WORKOUTS_LOAD_FAILED");
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const json = await request.json();
    const parsed = startWorkoutSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input", 400, "VALIDATION_ERROR");
    }

    const plan = await WorkoutPlanModel.findOne({
      _id: parsed.data.workoutPlanId,
      userId: session.user._id,
    });
    if (!plan) return fail("Workout plan not found.", 404, "PLAN_NOT_FOUND");
    const day = plan.days[parsed.data.dayIndex];
    if (!day?.workout || day.isRestDay) {
      return fail("That day is a rest day.", 400, "REST_DAY");
    }

    const lastWeights = new Map<string, number>();
    const previous = await WorkoutSessionModel.find({
      userId: session.user._id,
      status: "completed",
    })
      .sort({ completedAt: -1 })
      .limit(8);
    previous.forEach((row) => {
      row.exercises.forEach((ex: SessionExerciseLike) => {
        const key = String(ex.exercise);
        const best = ex.sets.reduce(
          (max: number, set: SessionSetLike) => Math.max(max, set.actualWeightKg),
          0
        );
        if (!lastWeights.has(key)) lastWeights.set(key, best);
      });
    });

    const created = await WorkoutSessionModel.create({
      userId: session.user._id,
      workoutPlanId: plan._id,
      dayIndex: parsed.data.dayIndex,
      workoutName: day.workout.name,
      status: "in_progress",
      startedAt: new Date(),
      exercises: day.workout.exercises.map((ex: any) => {
        const reps = parseInt(String(ex.reps).split("-")[0], 10) || 8;
        const weight = lastWeights.get(String(ex.exercise)) || ex.targetWeightKg || 40;
        const trackingType = ex.trackingType || "reps";
        const durationSec = ex.targetDurationSeconds || (trackingType === "timer" ? 300 : 0);

        return {
          exercise: ex.exercise,
          exerciseName: ex.exerciseName,
          targetMuscle: ex.targetMuscle,
          equipment: ex.equipment,
          imageUrl: ex.imageUrl,
          difficulty: ex.difficulty,
          instructions: ex.instructions,
          tips: ex.tips,
          restSeconds: ex.restSeconds,
          aiNote: ex.aiNote,
          phase: ex.phase || "main",
          trackingType,
          targetDurationSeconds: durationSec,
          isStretchFallback: Boolean(ex.isStretchFallback),
          stretchInstructions: ex.stretchInstructions || [],
          sets: Array.from({ length: ex.sets }, (_, idx) => ({
            setNumber: idx + 1,
            targetWeightKg: trackingType === "timer" ? 0 : weight,
            targetReps: trackingType === "timer" ? 1 : reps,
            actualWeightKg: trackingType === "timer" ? 0 : weight,
            actualReps: trackingType === "timer" ? 1 : reps,
            targetDurationSeconds: durationSec,
            actualDurationSeconds: durationSec,
            rpe: 8,
            completed: false,
          })),
        };
      }),
    });

    if (parsed.data.startWeightKg) {
      await BodyMeasurement.create({
        userId: session.user._id,
        date: new Date(),
        weightKg: Number(parsed.data.startWeightKg),
        bodyFatPercentage: 0,
        bmi: 0,
        origin: "WORKOUT_CHECKIN",
      });
    }

    return ok(
      {
        session: {
          id: String(created._id),
          status: created.status,
          workout: sessionToTemplate(created),
          exercises: created.exercises,
        },
      },
      201
    );
  } catch (error) {
    console.error("[workouts:start]", error);
    return fail("Unable to start workout.", 500, "WORKOUT_START_FAILED");
  }
}
