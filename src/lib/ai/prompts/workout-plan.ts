export function workoutPlanSystemPrompt() {
  return `You are FitForge AI, an expert strength, hypertrophy, and biomechanics coach.
Return ONLY valid JSON matching the provided schema.

Workouts must follow a structured multi-phase progression with a COMPREHENSIVE list of exercises per session:
1. FIRST: Analyze the user's data and plan the weekly split (which day trains which target muscles).
2. SECOND: For each active workout day, engineer a complete session covering all 5 structured phases (generating multiple exercises per phase, typically 10 to 18 total exercises per session depending on target duration):
   - Phase "warmup": 3 to 5 dynamic stretching & mobility movements (e.g. Arm Swings, Cat-Cow, Leg Swings, Shoulder Circles).
   - Phase "cardio": 3 to 5 time-based cardiovascular exercises (e.g. Treadmill Running, Stationary Cycling, Stepmill, Elliptical). Set trackingType to "timer" and specify targetDurationSeconds (e.g. 300 to 600 seconds).
   - Phase "bodyweight": 4 to 6 calisthenics & bodyweight movements (e.g. Dips, Push-ups, Sit-ups, Pull-ups, Planks, Bodyweight Squats) matching today's target muscle group.
   - Phase "main": 5 to 8 targeted machine & free-weight strength/hypertrophy exercises for the assigned body parts. Set trackingType to "reps".
   - Phase "cooldown": 3 to 5 static stretching & relaxation exercises (e.g. Doorway Chest Stretch, Hamstring Stretch, Child's Pose, Deep Breathing Stretch).
3. Propose exercises by standard training names. Never invent exercise IDs.
4. Rest days must set isRestDay: true, intensityLevel: "light", and omit workout or leave exercises empty.
5. ABS / CORE INTEGRATION: Schedule abdominal/core movements (e.g. Planks, Hanging Leg Raises, Ab Wheel) in bodyweight or main phases.
6. PACING & INTENSITY: First plan for a new user must have light/moderate initial sessions. Never schedule consecutive hard days without rest or light days between them.`;
}

export function workoutPlanUserPrompt(input: {
  goal: string;
  daysPerWeek: number;
  trainingDays?: string[];
  duration: number;
  experience: string;
  equipment: string[];
  focusMuscles: string[];
  preferences: string;
  planIntent?: string;
  catalog: string[];
  isFirstPlan?: boolean;
  completedSessionsCount?: number;
  recentSessionSummary?: string;
  lockedConstraints?: string;
  allowedDayNames?: string[];
}) {
  const catalog = input.catalog.slice(0, 80).join(", ");
  const specificDays = input.trainingDays?.length
    ? input.trainingDays.join(", ")
    : input.allowedDayNames?.length
    ? input.allowedDayNames.join(", ")
    : "Mon, Wed, Fri, Sat";

  const scheduleConstraint = input.allowedDayNames && input.allowedDayNames.length > 0
    ? `STRICT SCHEDULE REQUIREMENT: Only schedule workout sessions on these exact days: ${input.allowedDayNames.join(", ")}. Mark every other day with isRestDay: true.`
    : `Schedule ${input.daysPerWeek} training sessions across the week.`;

  const planStatusText = input.isFirstPlan || (input.completedSessionsCount ?? 0) === 0
    ? `FIRST-EVER GENERATED PLAN (0 prior workout sessions logged). CRITICAL PACING REQUIREMENT: The first 1-2 training sessions MUST be "light" or "moderate" intensity ramp-up/assessment sessions.`
    : `RENEWAL PLAN (User has logged ${input.completedSessionsCount || 0} completed workout sessions). Recent Performance: ${input.recentSessionSummary || "Good adherence"}.`;

  return `Build a weekly split (${input.duration} minutes per session).
${scheduleConstraint}

User Profile & Pacing Inputs:
- Specific Training Days: ${specificDays} (${input.daysPerWeek} days/week)
- User Experience Level: ${input.experience}
- Account Plan Status: ${planStatusText}
- Goal: ${input.goal}
- Equipment Available: ${input.equipment.join(", ") || "full gym"}
- Focus Muscles Requested: ${input.focusMuscles.join(", ") || "balanced physique"}
- Preferences / Notes: ${input.preferences || "none"}
${input.planIntent ? `- Plan Intent: ${input.planIntent}\n` : ""}
${input.lockedConstraints ? `\nLOCKED CONSTRAINTS (do NOT change or overwrite these days/exercises):\n${input.lockedConstraints}\n` : ""}

Allowed exercise names (prefer these when possible):
${catalog || "(catalog empty — use well-known gym exercise names)"}

IMPORTANT EXERCISE QUANTITY RULE:
Do NOT limit the session to only 5-7 exercises. Include a full, multi-exercise workout program for each active training day across ALL 5 phases:
- Phase "warmup": 3-5 dynamic stretching/mobility exercises
- Phase "cardio": 3-5 timer-based cardio exercises
- Phase "bodyweight": 4-6 calisthenics/bodyweight exercises
- Phase "main": 5-8 machine & strength exercises for target muscles
- Phase "cooldown": 3-5 static stretching/relaxation exercises
Total exercises per active workout day MUST be between 15 to 25 exercises.

JSON shape:
{
  "planTitle": string,
  "daysPerWeek": number,
  "days": [
    {
      "dayName": "Mon",
      "focus": "Push, Cardio & Core",
      "isRestDay": false,
      "intensityLevel": "moderate",
      "workout": {
        "name": string,
        "durationMinutes": number,
        "muscleGroups": [string],
        "exercises": [
          { "name": "Dynamic Arm Swings", "sets": 1, "reps": "12", "restSeconds": 30, "phase": "warmup", "trackingType": "reps", "aiNote": "Warmup shoulders" },
          { "name": "Cat-Cow Stretch", "sets": 1, "reps": "10", "restSeconds": 30, "phase": "warmup", "trackingType": "reps", "aiNote": "Spinal mobility" },
          { "name": "Treadmill Running", "sets": 1, "reps": "1", "restSeconds": 60, "phase": "cardio", "trackingType": "timer", "targetDurationSeconds": 600, "aiNote": "Cardio warm-up" },
          { "name": "Chest Dips", "sets": 3, "reps": "10-12", "restSeconds": 90, "phase": "bodyweight", "trackingType": "reps", "aiNote": "Calisthenics" },
          { "name": "Push-ups", "sets": 3, "reps": "15", "restSeconds": 60, "phase": "bodyweight", "trackingType": "reps", "aiNote": "Chest activation" },
          { "name": "Barbell Bench Press", "sets": 4, "reps": "8-10", "restSeconds": 120, "phase": "main", "trackingType": "reps", "aiNote": "Primary compound" },
          { "name": "Incline Dumbbell Press", "sets": 3, "reps": "10-12", "restSeconds": 90, "phase": "main", "trackingType": "reps", "aiNote": "Upper chest" },
          { "name": "Cable Chest Flyes", "sets": 3, "reps": "12-15", "restSeconds": 60, "phase": "main", "trackingType": "reps", "aiNote": "Isolation" },
          { "name": "Doorway Chest Stretch", "sets": 1, "reps": "1", "restSeconds": 30, "phase": "cooldown", "trackingType": "timer", "targetDurationSeconds": 60, "aiNote": "Static chest stretch" },
          { "name": "Child's Pose Stretch", "sets": 1, "reps": "1", "restSeconds": 30, "phase": "cooldown", "trackingType": "timer", "targetDurationSeconds": 60, "aiNote": "Relaxation stretch" }
        ]
      }
    }
  ]
}
Include exactly 7 weekday entries (Mon-Sun). Ensure intensityLevel is set to "light", "moderate", or "hard" for each training day matching pacing rules.`;
}

