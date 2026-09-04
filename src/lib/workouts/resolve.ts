import { ExerciseModel } from "@/models/Exercise";
import type { AiWorkoutPlan } from "@/lib/ai/schemas/workout-plan";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function findExerciseByName(name: string, targetMuscle?: string, phase?: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;

  // 1. Exact case-insensitive match
  const exact = await ExerciseModel.findOne({
    name: { $regex: `^${escapeRegex(trimmed)}$`, $options: "i" },
  });
  if (exact) return exact;

  // 2. Substring match
  const substringMatch = await ExerciseModel.findOne({
    name: { $regex: escapeRegex(trimmed), $options: "i" },
  });
  if (substringMatch) return substringMatch;

  // 3. Token-based matching (e.g. "treadmill", "dips", "bench")
  const stopWords = new Set(["the", "and", "with", "for", "arm", "leg", "day", "exercise", "set", "rep"]);
  const tokens = trimmed
    .toLowerCase()
    .split(/[\s\-_]+/)
    .filter((t) => t.length > 2 && !stopWords.has(t));

  for (const token of tokens) {
    const tokenMatch = await ExerciseModel.findOne({
      name: { $regex: escapeRegex(token), $options: "i" },
    });
    if (tokenMatch) return tokenMatch;
  }

  // 4. Category / Muscle / Phase matching
  if (phase === "cardio") {
    const cardioMatch = await ExerciseModel.findOne({
      $or: [{ exerciseType: "Cardio" }, { bodyParts: { $regex: "cardio", $options: "i" } }],
    });
    if (cardioMatch) return cardioMatch;
  }

  if (phase === "warmup" || phase === "cooldown") {
    const mobilityMatch = await ExerciseModel.findOne({
      $or: [{ exerciseType: "Mobility" }, { name: { $regex: "stretch", $options: "i" } }],
    });
    if (mobilityMatch) return mobilityMatch;
  }

  if (targetMuscle && targetMuscle !== "General" && targetMuscle !== "Full Body") {
    const muscleMatch = await ExerciseModel.findOne({
      $or: [
        { targetMuscles: { $regex: targetMuscle, $options: "i" } },
        { bodyParts: { $regex: targetMuscle, $options: "i" } },
      ],
    });
    if (muscleMatch) return muscleMatch;
  }

  // 5. Ultimate fallback: return any exercise document from database catalog
  return ExerciseModel.findOne();
}

function inferPhase(match: any, name: string, givenPhase?: string): "warmup" | "cardio" | "bodyweight" | "main" | "cooldown" {
  if (givenPhase && ["warmup", "cardio", "bodyweight", "main", "cooldown"].includes(givenPhase)) {
    return givenPhase as any;
  }
  const lowerName = name.toLowerCase();
  if (lowerName.includes("stretch") || lowerName.includes("warmup") || lowerName.includes("mobility")) {
    return lowerName.includes("cool") ? "cooldown" : "warmup";
  }
  if (
    lowerName.includes("running") ||
    lowerName.includes("cycling") ||
    lowerName.includes("treadmill") ||
    lowerName.includes("stepmill") ||
    lowerName.includes("elliptical") ||
    lowerName.includes("rowing") ||
    lowerName.includes("walk") ||
    match?.exerciseType === "Cardio" ||
    match?.bodyParts?.some((bp: string) => bp.toLowerCase().includes("cardio"))
  ) {
    return "cardio";
  }
  const isBodyweight =
    match?.equipments?.some((e: string) => /body weight|bodyweight/i.test(e)) ||
    lowerName.includes("dip") ||
    lowerName.includes("push-up") ||
    lowerName.includes("pushup") ||
    lowerName.includes("pull-up") ||
    lowerName.includes("sit-up") ||
    lowerName.includes("plank");

  if (isBodyweight) return "bodyweight";
  return "main";
}

function inferTrackingType(phase: string, match: any, name: string, givenType?: string): "reps" | "timer" {
  if (givenType === "timer" || givenType === "reps") return givenType;
  const lowerName = name.toLowerCase();
  if (
    phase === "cardio" ||
    lowerName.includes("plank") ||
    lowerName.includes("running") ||
    lowerName.includes("cycling") ||
    lowerName.includes("treadmill") ||
    lowerName.includes("stepmill") ||
    lowerName.includes("elliptical") ||
    lowerName.includes("walking") ||
    lowerName.includes("stretch") ||
    lowerName.includes("hold")
  ) {
    return "timer";
  }
  return "reps";
}

export async function catalogNamesForPlanner(focusMuscles: string[]) {
  const names = new Set<string>();
  const queries = focusMuscles.length > 0 ? focusMuscles : ["chest", "back", "legs", "abs"];
  
  // 1. Target muscle exercises
  for (const rawMuscle of queries) {
    const muscleTerms =
      rawMuscle.toLowerCase().includes("abs") || rawMuscle.toLowerCase().includes("core")
        ? ["waist", "abs", "obliques", "core"]
        : [rawMuscle];

    for (const muscle of muscleTerms) {
      const rows = await ExerciseModel.find({
        $or: [
          { targetMuscles: { $regex: muscle, $options: "i" } },
          { bodyParts: { $regex: muscle, $options: "i" } },
          { primaryMuscles: { $regex: muscle, $options: "i" } },
          { name: { $regex: muscle, $options: "i" } },
        ],
      })
        .sort({ name: 1 })
        .limit(15);
      rows.forEach((row) => names.add(row.name));
    }
  }

  // 2. Cardio exercises (Running, Cycling, Stepmill, Walking, Elliptical)
  const cardioRows = await ExerciseModel.find({
    $or: [
      { exerciseType: "Cardio" },
      { bodyParts: { $regex: "cardio", $options: "i" } },
      { name: { $regex: "run|cycle|bike|treadmill|stepmill|elliptical|row|walk", $options: "i" } },
    ],
  }).limit(15);
  cardioRows.forEach((row) => names.add(row.name));

  // 3. Bodyweight / Calisthenics exercises (Dips, Pushups, Situps, Pullups, Planks)
  const bodyweightRows = await ExerciseModel.find({
    $or: [
      { equipments: { $regex: "body weight|bodyweight", $options: "i" } },
      { name: { $regex: "dip|push-up|pushup|pull-up|sit-up|plank|lunge", $options: "i" } },
    ],
  }).limit(15);
  bodyweightRows.forEach((row) => names.add(row.name));

  // 4. Stretching / Mobility exercises
  const stretchRows = await ExerciseModel.find({
    $or: [
      { exerciseType: "Mobility" },
      { name: { $regex: "stretch|mobility|warmup|flexibility", $options: "i" } },
    ],
  }).limit(15);
  stretchRows.forEach((row) => names.add(row.name));

  if (names.size < 25) {
    const extra = await ExerciseModel.find().sort({ name: 1 }).limit(40);
    extra.forEach((row) => names.add(row.name));
  }

  console.log(`[catalogNamesForPlanner] Catalog collected ${names.size} exercise names for planner.`);
  return [...names];
}

export async function resolvePlanDays(plan: AiWorkoutPlan, allowedDayNames?: string[]) {
  const fallbackExerciseDoc = await ExerciseModel.findOne();
  console.log(`[resolvePlanDays] Resolving plan "${plan.planTitle}" with ${plan.days.length} proposed days. Allowed day names:`, allowedDayNames);

  const days = [];
  for (const day of plan.days) {
    // Normalizing dayName checks (e.g. "Mon" vs "mon" vs "Monday")
    const normDayName = day.dayName?.trim();
    const isAllowedDay =
      !allowedDayNames ||
      allowedDayNames.length === 0 ||
      allowedDayNames.some(
        (allowed) =>
          allowed.toLowerCase() === normDayName.toLowerCase() ||
          allowed.toLowerCase().startsWith(normDayName.toLowerCase()) ||
          normDayName.toLowerCase().startsWith(allowed.toLowerCase())
      );

    if (!isAllowedDay || day.isRestDay || !day.workout || !day.workout.exercises || day.workout.exercises.length === 0) {
      console.log(`[resolvePlanDays] Day "${day.dayName}" resolves as REST DAY (isAllowed: ${isAllowedDay}, isRestDay: ${day.isRestDay})`);
      days.push({
        dayName: day.dayName,
        focus: day.focus,
        isRestDay: true,
        intensityLevel: "light" as const,
      });
      continue;
    }

    const exercises = [];
    for (const proposed of day.workout.exercises) {
      const phase = inferPhase(null, proposed.name, proposed.phase);
      const match = await findExerciseByName(proposed.name, day.focus, phase);
      const trackingType = inferTrackingType(phase, match, proposed.name, proposed.trackingType);

      if (!match) {
        console.warn(`[resolvePlanDays] Exercise "${proposed.name}" could not be matched even via fallback catalog!`);
        if (fallbackExerciseDoc) {
          exercises.push({
            exercise: fallbackExerciseDoc._id,
            exerciseName: proposed.name,
            targetMuscle: "Full Body",
            sets: proposed.sets || 1,
            reps: proposed.reps || "1",
            restSeconds: proposed.restSeconds || 30,
            aiNote: proposed.aiNote || `Perform movement: ${proposed.name}`,
            equipment: "body weight",
            targetWeightKg: 0,
            imageUrl: "",
            difficulty: "Beginner",
            instructions: [
              `Perform ${proposed.name} focusing on ${day.focus || "target muscles"}.`,
            ],
            tips: ["Maintain steady form."],
            phase,
            trackingType,
            targetDurationSeconds: proposed.targetDurationSeconds || 60,
            isStretchFallback: true,
            stretchInstructions: [`Perform ${proposed.name} gently.`],
          });
        }
        continue;
      }

      const targetMuscle = match.targetMuscles?.[0] || match.target || match.bodyParts?.[0] || "General";
      const eqName = match.equipments?.[0] || match.equipment || "body weight";
      const durationSec = proposed.targetDurationSeconds || (trackingType === "timer" ? 300 : 0);

      const isStretchFallback = (phase === "warmup" || phase === "cooldown" || proposed.name.toLowerCase().includes("stretch")) && !match.gifUrl;

      exercises.push({
        exercise: match._id,
        exerciseName: proposed.name, // Use proposed AI name for exact specificity
        targetMuscle,
        sets: proposed.sets || 3,
        reps: proposed.reps || "10",
        restSeconds: proposed.restSeconds || 60,
        aiNote: proposed.aiNote || "",
        equipment: eqName,
        targetWeightKg: 0,
        imageUrl: match.gifUrl || "",
        difficulty: match.difficulty || "Intermediate",
        instructions: match.instructions?.length ? match.instructions : [`Perform ${proposed.name} with controlled tempo.`],
        tips: match.tips || [],
        phase,
        trackingType,
        targetDurationSeconds: durationSec,
        isStretchFallback,
        stretchInstructions: isStretchFallback
          ? [
              `Perform ${proposed.name} gently for ${durationSec || 60} seconds.`,
              "Keep steady breathing and avoid forcing the range of motion.",
            ]
          : [],
      });
    }

    const isRest = exercises.length === 0;
    console.log(`[resolvePlanDays] Day "${day.dayName}" resolved ${exercises.length} exercises (Rest Day: ${isRest}).`);

    days.push({
      dayName: day.dayName,
      focus: day.focus,
      isRestDay: isRest,
      intensityLevel: day.intensityLevel || "moderate",
      workout: isRest
        ? undefined
        : {
            name: day.workout.name,
            durationMinutes: day.workout.durationMinutes || 45,
            muscleGroups: day.workout.muscleGroups || [],
            category: "Full Body" as const,
            exercises,
          },
    });
  }

  const trainingDays = days.filter((day) => !day.isRestDay).length;
  console.log(`[resolvePlanDays] Final resolution: ${trainingDays} training days, ${days.length - trainingDays} rest days.`);
  return { days, trainingDays };
}
