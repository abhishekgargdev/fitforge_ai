import type {
  CompletedWorkoutSummary,
  WorkoutSplitSchedule,
  WorkoutTemplate,
  WorkoutExerciseItem,
} from "@/types";

export function toSplitDto(plan: {
  _id: { toString(): string };
  title: string;
  daysPerWeek: number;
  planMode?: "ai" | "manual";
  nextPlanGenerationDate?: Date;
  days: Array<{
    dayName: string;
    focus?: string;
    isRestDay?: boolean;
    skipped?: boolean;
    skipReason?: string;
    workout?: {
      name: string;
      durationMinutes: number;
      muscleGroups?: string[];
      category?: WorkoutTemplate["category"];
      exercises?: Array<{
        exercise: { toString(): string };
        exerciseName: string;
        targetMuscle: string;
        sets: number;
        reps: string;
        restSeconds: number;
        aiNote?: string;
        equipment?: string;
        targetWeightKg?: number;
        imageUrl?: string;
        difficulty?: WorkoutExerciseItem["difficulty"];
        instructions?: string[];
        tips?: string[];
      }>;
    };
  }>;
}): WorkoutSplitSchedule {
  return {
    id: String(plan._id),
    title: plan.title,
    daysPerWeek: plan.daysPerWeek,
    planMode: plan.planMode || "ai",
    nextPlanGenerationDate: plan.nextPlanGenerationDate ? plan.nextPlanGenerationDate.toISOString() : undefined,
    days: plan.days.map((day) => ({
      dayName: day.dayName,
      day: day.dayName,
      focus: day.focus || "",
      isRestDay: Boolean(day.isRestDay),
      skipped: Boolean(day.skipped),
      skipReason: day.skipReason || "",
      locked: Boolean((day as { locked?: boolean }).locked),
      workout: day.isRestDay || !day.workout
        ? undefined
        : {
            id: `${String(plan._id)}-${day.dayName}`,
            name: day.workout.name,
            durationMinutes: day.workout.durationMinutes,
            muscleGroups: (day.workout.muscleGroups || []) as WorkoutTemplate["muscleGroups"],
            category: day.workout.category || "Full Body",
            exercises: (day.workout.exercises || []).map((ex) => ({
              exerciseId: String(ex.exercise),
              exerciseName: ex.exerciseName,
              targetMuscle: ex.targetMuscle as WorkoutExerciseItem["targetMuscle"],
              sets: ex.sets,
              reps: ex.reps,
              restSeconds: ex.restSeconds,
              aiNote: ex.aiNote,
              equipment: ex.equipment || "",
              targetWeightKg: ex.targetWeightKg,
              imageUrl: ex.imageUrl,
              difficulty: ex.difficulty,
              instructions: ex.instructions,
              tips: ex.tips,
              locked: Boolean((ex as { locked?: boolean }).locked),
            })),
          },
    })),
  };
}

export function sessionToTemplate(session: {
  _id: { toString(): string };
  workoutName: string;
  exercises: Array<{
    exercise: { toString(): string };
    exerciseName: string;
    targetMuscle: string;
    equipment?: string;
    imageUrl?: string;
    difficulty?: string;
    instructions?: string[];
    tips?: string[];
    restSeconds: number;
    aiNote?: string;
    sets: Array<{
      setNumber: number;
      targetWeightKg: number;
      targetReps: number;
      actualWeightKg: number;
      actualReps: number;
      rpe?: number;
      completed: boolean;
    }>;
  }>;
}): WorkoutTemplate {
  return {
    id: String(session._id),
    name: session.workoutName,
    durationMinutes: 60,
    muscleGroups: [],
    category: "Full Body",
    exercises: session.exercises.map((ex) => ({
      exerciseId: String(ex.exercise),
      exerciseName: ex.exerciseName,
      targetMuscle: ex.targetMuscle as WorkoutExerciseItem["targetMuscle"],
      sets: ex.sets.length,
      reps: String(ex.sets[0]?.targetReps ?? 8),
      restSeconds: ex.restSeconds,
      aiNote: ex.aiNote,
      equipment: ex.equipment || "",
      targetWeightKg: ex.sets[0]?.targetWeightKg,
      imageUrl: ex.imageUrl,
      difficulty: (ex.difficulty as WorkoutExerciseItem["difficulty"]) || "Intermediate",
      instructions: ex.instructions,
      tips: ex.tips,
    })),
  };
}

export function sessionToSummary(session: {
  _id: { toString(): string };
  workoutName: string;
  completedAt?: Date;
  createdAt?: Date;
  durationMinutes: number;
  totalVolumeKg: number;
  totalSets: number;
  totalExercises: number;
  caloriesBurnedEstimate: number;
  personalRecords?: string[];
  volumeChangeVsPreviousPercentage?: number;
  aiSummary?: string;
}): CompletedWorkoutSummary {
  const when = session.completedAt || session.createdAt;
  return {
    id: String(session._id),
    workoutName: session.workoutName,
    date: when ? when.toISOString() : new Date().toISOString(),
    durationMinutes: session.durationMinutes,
    totalVolumeKg: session.totalVolumeKg,
    totalSets: session.totalSets,
    totalExercises: session.totalExercises,
    caloriesBurnedEstimate: session.caloriesBurnedEstimate,
    personalRecords: session.personalRecords ?? [],
    volumeChangeVsPreviousPercentage: session.volumeChangeVsPreviousPercentage ?? 0,
    aiSummary: session.aiSummary || "Solid session. Keep progressive overload consistent next time.",
  };
}
