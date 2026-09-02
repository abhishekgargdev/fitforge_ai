import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/mongodb";
import { swapExerciseWithAi } from "@/lib/workouts/swap";
import { WorkoutPlanModel } from "@/models/WorkoutPlan";
import { ExerciseModel } from "@/models/Exercise";
import { toExerciseDto } from "@/lib/exercises/map";

const calculateWorkoutDurationMinutes = (exercises: Array<{ sets?: number; restSeconds?: number; reps?: string }>) => {
  const totalMinutes = (exercises || []).reduce((sum, exercise) => {
    const sets = Number(exercise.sets || 0);
    const restSeconds = Number(exercise.restSeconds || 0);
    const baseWorkSeconds = Math.max(45, Number(String(exercise.reps || "8-12").split("-")[0] || 8) * 2.4 * sets);
    return sum + Math.max(8, Math.ceil((baseWorkSeconds + sets * restSeconds) / 60));
  }, 0);

  return Math.max(30, Math.round(totalMinutes));
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; dayId: string; exerciseId: string }> }
) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const { id, dayId, exerciseId } = await context.params;
    if (!id || !dayId || !exerciseId) {
      return fail("Plan ID, Day ID, and Exercise ID are required.", 400, "VALIDATION_ERROR");
    }

    const body = await request.json().catch(() => ({}));
    const reason = body.reason || "";
    const excludeEquipment = Array.isArray(body.excludeEquipment) ? body.excludeEquipment : [];
    const accept = Boolean(body.accept);
    const targetExerciseId = body.targetExerciseId; // direct manual swap selection

    await connectDB();
    const plan = await WorkoutPlanModel.findOne({ _id: id, userId: session.user._id });
    if (!plan) return fail("Workout plan not found.", 404, "PLAN_NOT_FOUND");

    // Find the day (by dayName or index)
    const day = plan.days.find((d: any) => d.dayName.toLowerCase() === dayId.toLowerCase() || String(d._id) === dayId);
    if (!day || !day.workout) return fail("Workout day not found.", 404, "DAY_NOT_FOUND");

    // Find exercise in day
    const exIndex = day.workout.exercises.findIndex(
      (e: any) => String(e.exercise) === exerciseId || e.exerciseName.toLowerCase() === exerciseId.toLowerCase()
    );
    if (exIndex === -1) return fail("Exercise not found in workout day.", 404, "EXERCISE_NOT_FOUND");

    const currentEx = day.workout.exercises[exIndex];

    // Phase 18 Locking check
    if (currentEx.locked || day.locked) {
      return fail(
        "Cannot swap a locked exercise or day. Please unlock it first in your plan.",
        400,
        "EXERCISE_LOCKED"
      );
    }

    const existingNames = day.workout.exercises.map((e: any) => e.exerciseName);

    // If candidate targetExerciseId provided directly (manual pick swap)
    if (targetExerciseId) {
      let replacementDoc = await ExerciseModel.findOne({ exerciseId: targetExerciseId });
      if (!replacementDoc) replacementDoc = await ExerciseModel.findById(targetExerciseId);
      if (!replacementDoc) return fail("Selected exercise not found.", 404, "EXERCISE_NOT_FOUND");

      const replacementDto = toExerciseDto(replacementDoc);
      const updatedExercise = {
        exercise: replacementDoc._id,
        exerciseName: replacementDoc.name,
        targetMuscle: replacementDoc.targetMuscles?.[0] || replacementDoc.target || currentEx.targetMuscle,
        sets: currentEx.sets,
        reps: currentEx.reps,
        restSeconds: currentEx.restSeconds,
        aiNote: `Swapped from ${currentEx.exerciseName}`,
        equipment: replacementDoc.equipments?.[0] || replacementDoc.equipment || currentEx.equipment,
        targetWeightKg: currentEx.targetWeightKg || 0,
        imageUrl: replacementDoc.gifUrl,
        difficulty: replacementDoc.difficulty,
        instructions: replacementDoc.instructions,
        tips: replacementDoc.tips,
        locked: false,
      };

      day.workout.exercises[exIndex] = updatedExercise;
      day.workout.durationMinutes = calculateWorkoutDurationMinutes(day.workout.exercises);
      plan.swapHistory.push({
        originalExerciseId: String(currentEx.exercise),
        originalExerciseName: currentEx.exerciseName,
        swappedToExerciseId: replacementDoc._id,
        swappedToExerciseName: replacementDoc.name,
        swappedAt: new Date(),
        reason: reason || "Manual selection",
      });

      await plan.save();
      return ok({ success: true, plan, swappedTo: replacementDto });
    }

    // AI swap candidate generation
    const swapResult = await swapExerciseWithAi({
      originalExerciseName: currentEx.exerciseName,
      targetMuscle: currentEx.targetMuscle,
      equipment: currentEx.equipment,
      reason,
      excludeEquipment,
      existingDayExerciseNames: existingNames,
    });

    if (!accept) {
      // Return preview without saving
      return ok({
        candidate: swapResult.exerciseDto,
        reasoning: swapResult.reasoning,
      });
    }

    // Commit swap to plan document
    const replacementDoc = swapResult.exerciseDoc;
    const updatedExercise = {
      exercise: replacementDoc._id,
      exerciseName: replacementDoc.name,
      targetMuscle: replacementDoc.targetMuscles?.[0] || replacementDoc.target || currentEx.targetMuscle,
      sets: currentEx.sets,
      reps: currentEx.reps,
      restSeconds: currentEx.restSeconds,
      aiNote: swapResult.reasoning,
      equipment: replacementDoc.equipments?.[0] || replacementDoc.equipment || currentEx.equipment,
      targetWeightKg: currentEx.targetWeightKg || 0,
      imageUrl: replacementDoc.gifUrl,
      difficulty: replacementDoc.difficulty,
      instructions: replacementDoc.instructions,
      tips: replacementDoc.tips,
      locked: false,
    };

    day.workout.exercises[exIndex] = updatedExercise;
    day.workout.durationMinutes = calculateWorkoutDurationMinutes(day.workout.exercises);
    plan.swapHistory.push({
      originalExerciseId: String(currentEx.exercise),
      originalExerciseName: currentEx.exerciseName,
      swappedToExerciseId: replacementDoc._id,
      swappedToExerciseName: replacementDoc.name,
      swappedAt: new Date(),
      reason,
    });

    await plan.save();
    return ok({ success: true, plan, swappedTo: swapResult.exerciseDto });
  } catch (error) {
    console.error("[workout-plans:swap]", error);
    return fail("Unable to swap exercise.", 500, "SWAP_FAILED");
  }
}
