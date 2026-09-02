import { ExerciseModel } from "@/models/Exercise";
import type { AiWorkoutPlan } from "@/lib/ai/schemas/workout-plan";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function findExerciseByName(name: string) {
  const exact = await ExerciseModel.findOne({
    name: { $regex: `^${escapeRegex(name.trim())}$`, $options: "i" },
  });
  if (exact) return exact;
  return ExerciseModel.findOne({
    name: { $regex: escapeRegex(name.trim()), $options: "i" },
  });
}

export async function catalogNamesForPlanner(focusMuscles: string[]) {
  const names = new Set<string>();
  const queries = focusMuscles.length > 0 ? focusMuscles : ["chest", "back", "legs"];
  for (const muscle of queries) {
    const rows = await ExerciseModel.find({
      $or: [
        { target: { $regex: muscle, $options: "i" } },
        { bodyPart: { $regex: muscle, $options: "i" } },
        { name: { $regex: muscle, $options: "i" } },
      ],
    })
      .sort({ name: 1 })
      .limit(20);
    rows.forEach((row) => names.add(row.name));
  }
  if (names.size < 20) {
    const extra = await ExerciseModel.find().sort({ name: 1 }).limit(40);
    extra.forEach((row) => names.add(row.name));
  }
  return [...names];
}

export async function resolvePlanDays(plan: AiWorkoutPlan, allowedDayNames?: string[]) {
  const days = [];
  for (const day of plan.days) {
    const isAllowedDay = !allowedDayNames || allowedDayNames.length === 0 || allowedDayNames.includes(day.dayName);
    if (!isAllowedDay || day.isRestDay || !day.workout) {
      days.push({
        dayName: day.dayName,
        focus: day.focus,
        isRestDay: true,
      });
      continue;
    }

    const exercises = [];
    for (const proposed of day.workout.exercises) {
      const match = await findExerciseByName(proposed.name);
      if (!match) continue;
      exercises.push({
        exercise: match._id,
        exerciseName: match.name,
        targetMuscle: match.target,
        sets: proposed.sets,
        reps: proposed.reps,
        restSeconds: proposed.restSeconds,
        aiNote: proposed.aiNote || "",
        equipment: match.equipment,
        targetWeightKg: 0,
        imageUrl: match.gifUrl,
        difficulty: match.difficulty,
        instructions: match.instructions,
        tips: match.tips,
      });
    }

    days.push({
      dayName: day.dayName,
      focus: day.focus,
      isRestDay: exercises.length === 0,
      workout:
        exercises.length === 0
          ? undefined
          : {
              name: day.workout.name,
              durationMinutes: day.workout.durationMinutes,
              muscleGroups: day.workout.muscleGroups,
              category: "Full Body" as const,
              exercises,
            },
    });
  }

  const trainingDays = days.filter((day) => !day.isRestDay).length;
  return { days, trainingDays };
}
