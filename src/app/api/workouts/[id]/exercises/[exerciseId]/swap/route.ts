import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/mongodb";
import { swapExerciseWithAi } from "@/lib/workouts/swap";
import { WorkoutSessionModel } from "@/models/WorkoutSession";
import { ExerciseModel } from "@/models/Exercise";
import { toExerciseDto } from "@/lib/exercises/map";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; exerciseId: string }> }
) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const { id, exerciseId } = await context.params;
    if (!id || !exerciseId) {
      return fail("Session ID and Exercise ID are required.", 400, "VALIDATION_ERROR");
    }

    const body = await request.json().catch(() => ({}));
    const reason = body.reason || "";
    const excludeEquipment = Array.isArray(body.excludeEquipment) ? body.excludeEquipment : [];
    const accept = Boolean(body.accept);
    const targetExerciseId = body.targetExerciseId;

    await connectDB();
    const workoutSession = await WorkoutSessionModel.findOne({ _id: id, userId: session.user._id });
    if (!workoutSession) return fail("Workout session not found.", 404, "SESSION_NOT_FOUND");

    const exIndex = workoutSession.exercises.findIndex(
      (e: any) => String(e.exercise) === exerciseId || e.exerciseName.toLowerCase() === exerciseId.toLowerCase()
    );
    if (exIndex === -1) return fail("Exercise not found in session.", 404, "EXERCISE_NOT_FOUND");

    const currentEx = workoutSession.exercises[exIndex];
    const existingNames = workoutSession.exercises.map((e: any) => e.exerciseName);

    // Direct manual selection
    if (targetExerciseId) {
      let replacementDoc = await ExerciseModel.findOne({ exerciseId: targetExerciseId });
      if (!replacementDoc) replacementDoc = await ExerciseModel.findById(targetExerciseId);
      if (!replacementDoc) return fail("Selected exercise not found.", 404, "EXERCISE_NOT_FOUND");

      const replacementDto = toExerciseDto(replacementDoc);
      const updatedExercise = {
        exercise: replacementDoc._id,
        exerciseName: replacementDoc.name,
        targetMuscle: replacementDoc.targetMuscles?.[0] || replacementDoc.target || currentEx.targetMuscle,
        equipment: replacementDoc.equipments?.[0] || replacementDoc.equipment || currentEx.equipment,
        imageUrl: replacementDoc.gifUrl,
        difficulty: replacementDoc.difficulty,
        instructions: replacementDoc.instructions,
        tips: replacementDoc.tips,
        restSeconds: currentEx.restSeconds,
        aiNote: `Swapped from ${currentEx.exerciseName}`,
        sets: currentEx.sets,
      };

      workoutSession.exercises[exIndex] = updatedExercise;
      workoutSession.swapHistory.push({
        originalExerciseId: String(currentEx.exercise),
        originalExerciseName: currentEx.exerciseName,
        swappedToExerciseId: replacementDoc._id,
        swappedToExerciseName: replacementDoc.name,
        swappedAt: new Date(),
        reason: reason || "Manual selection",
      });

      await workoutSession.save();
      return ok({ success: true, session: workoutSession, swappedTo: replacementDto });
    }

    // AI swap candidate preview
    const swapResult = await swapExerciseWithAi({
      originalExerciseName: currentEx.exerciseName,
      targetMuscle: currentEx.targetMuscle,
      equipment: currentEx.equipment,
      reason,
      excludeEquipment,
      existingDayExerciseNames: existingNames,
    });

    if (!accept) {
      return ok({
        candidate: swapResult.exerciseDto,
        reasoning: swapResult.reasoning,
      });
    }

    // Commit swap to session document
    const replacementDoc = swapResult.exerciseDoc;
    const updatedExercise = {
      exercise: replacementDoc._id,
      exerciseName: replacementDoc.name,
      targetMuscle: replacementDoc.targetMuscles?.[0] || replacementDoc.target || currentEx.targetMuscle,
      equipment: replacementDoc.equipments?.[0] || replacementDoc.equipment || currentEx.equipment,
      imageUrl: replacementDoc.gifUrl,
      difficulty: replacementDoc.difficulty,
      instructions: replacementDoc.instructions,
      tips: replacementDoc.tips,
      restSeconds: currentEx.restSeconds,
      aiNote: swapResult.reasoning,
      sets: currentEx.sets,
    };

    workoutSession.exercises[exIndex] = updatedExercise;
    workoutSession.swapHistory.push({
      originalExerciseId: String(currentEx.exercise),
      originalExerciseName: currentEx.exerciseName,
      swappedToExerciseId: replacementDoc._id,
      swappedToExerciseName: replacementDoc.name,
      swappedAt: new Date(),
      reason,
    });

    await workoutSession.save();
    return ok({ success: true, session: workoutSession, swappedTo: swapResult.exerciseDto });
  } catch (error) {
    console.error("[workouts:swap]", error);
    return fail("Unable to swap exercise.", 500, "SWAP_FAILED");
  }
}
