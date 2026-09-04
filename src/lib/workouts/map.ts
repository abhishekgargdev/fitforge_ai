import type {
  CompletedWorkoutSummary,
  WorkoutSplitSchedule,
  WorkoutTemplate,
  WorkoutExerciseItem,
} from "@/types";

export function toSplitDto(plan: any): WorkoutSplitSchedule {
  if (!plan) {
    return {
      id: "",
      title: "No Plan",
      daysPerWeek: 0,
      planMode: "ai",
      days: [],
    };
  }

  const rawDays: any[] = Array.isArray(plan.days) ? plan.days : [];
  return {
    id: String(plan._id || plan.id || ""),
    title: plan.title || "Workout Plan",
    daysPerWeek: plan.daysPerWeek || 0,
    planMode: plan.planMode || "ai",
    nextPlanGenerationDate: plan.nextPlanGenerationDate
      ? new Date(plan.nextPlanGenerationDate).toISOString()
      : undefined,
    days: rawDays.map((day: any) => ({
      dayName: day.dayName || "Day",
      day: day.dayName || "Day",
      focus: day.focus || "",
      isRestDay: Boolean(day.isRestDay),
      skipped: Boolean(day.skipped),
      skipReason: day.skipReason || "",
      locked: Boolean(day.locked),
      workout: day.isRestDay || !day.workout
        ? undefined
        : {
            id: `${String(plan._id || plan.id)}-${day.dayName}`,
            name: day.workout.name || "Workout",
            durationMinutes: day.workout.durationMinutes || 45,
            muscleGroups: (day.workout.muscleGroups || []) as WorkoutTemplate["muscleGroups"],
            category: day.workout.category || "Full Body",
            exercises: (day.workout.exercises || []).map((ex: any) => ({
              exerciseId: String(ex.exercise?._id || ex.exercise || ""),
              exerciseName: ex.exerciseName || "Exercise",
              targetMuscle: ex.targetMuscle as WorkoutExerciseItem["targetMuscle"],
              sets: ex.sets || 3,
              reps: String(ex.reps || "10"),
              restSeconds: ex.restSeconds || 60,
              aiNote: ex.aiNote || "",
              equipment: ex.equipment || "",
              targetWeightKg: ex.targetWeightKg || 0,
              imageUrl: ex.imageUrl || "",
              difficulty: ex.difficulty || "Intermediate",
              instructions: ex.instructions || [],
              tips: ex.tips || [],
              locked: Boolean(ex.locked),
              phase: ex.phase || "main",
              trackingType: ex.trackingType || "reps",
              targetDurationSeconds: ex.targetDurationSeconds || 0,
              isStretchFallback: Boolean(ex.isStretchFallback),
              stretchInstructions: ex.stretchInstructions || [],
            })),
          },
    })),
  };
}

export function sessionToTemplate(session: any): WorkoutTemplate {
  const rawExercises: any[] = Array.isArray(session.exercises) ? session.exercises : [];
  return {
    id: String(session._id || session.id || ""),
    name: session.workoutName || "Workout Session",
    durationMinutes: session.durationMinutes || 60,
    muscleGroups: [],
    category: "Full Body",
    exercises: rawExercises.map((ex: any) => ({
      exerciseId: String(ex.exercise?._id || ex.exercise || ""),
      exerciseName: ex.exerciseName || "Exercise",
      targetMuscle: ex.targetMuscle as WorkoutExerciseItem["targetMuscle"],
      sets: Array.isArray(ex.sets) ? ex.sets.length : 3,
      reps: String(ex.sets?.[0]?.targetReps ?? 8),
      restSeconds: ex.restSeconds || 60,
      aiNote: ex.aiNote || "",
      equipment: ex.equipment || "",
      targetWeightKg: ex.sets?.[0]?.targetWeightKg || 0,
      imageUrl: ex.imageUrl || "",
      difficulty: (ex.difficulty as WorkoutExerciseItem["difficulty"]) || "Intermediate",
      instructions: ex.instructions || [],
      tips: ex.tips || [],
      phase: ex.phase || "main",
      trackingType: ex.trackingType || "reps",
      targetDurationSeconds: ex.targetDurationSeconds || 0,
      isStretchFallback: Boolean(ex.isStretchFallback),
      stretchInstructions: ex.stretchInstructions || [],
    })),
  };
}

export function sessionToSummary(session: any): CompletedWorkoutSummary {
  const when = session.completedAt || session.createdAt;
  const dateStr = when ? new Date(when).toISOString() : new Date().toISOString();
  return {
    id: String(session._id || session.id || ""),
    workoutName: session.workoutName || "Workout",
    date: dateStr,
    durationMinutes: session.durationMinutes || 0,
    totalVolumeKg: session.totalVolumeKg || 0,
    totalSets: session.totalSets || 0,
    totalExercises: session.totalExercises || 0,
    caloriesBurnedEstimate: session.caloriesBurnedEstimate || 0,
    personalRecords: session.personalRecords ?? [],
    volumeChangeVsPreviousPercentage: session.volumeChangeVsPreviousPercentage ?? 0,
    aiSummary: session.aiSummary || "Solid session. Keep progressive overload consistent next time.",
  };
}
