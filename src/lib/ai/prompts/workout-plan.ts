export function workoutPlanSystemPrompt() {
  return `You are FitForge AI, an expert strength, hypertrophy, and conditioning coach.
Return ONLY valid JSON matching the provided schema.
Rules:
1. Propose exercises by common training names only. Never invent exercise IDs.
2. Prefer names from the allowed exercise list when one is provided.
3. Rest days must set isRestDay: true, intensityLevel: "light", and omit workout or leave exercises empty.
4. Training days must include 4 to 6 compound and isolation movements with appropriate intensityLevel ("light" | "moderate" | "hard").
5. ABS / CORE INTEGRATION: Automatically schedule core/abdominal movements (e.g., Planks, Hanging Leg Raises, Cable Woodchoppers, Ab Wheel) when appropriate for general fitness, fat loss, or strength goals, even if not explicitly selected as a focus muscle.
6. PACING & INTENSITY RULES:
   - IF THIS IS THE USER'S FIRST PLAN (no prior completed sessions): The first 1-2 training sessions of the week MUST be "light" or "moderate" intensity (an onboarding assessment & ramp-up session, NOT the hardest session of the week) regardless of experience level.
   - Distribute intensity across the week (e.g. Moderate -> Light -> Hard -> Moderate). NEVER front-load the single hardest session on Day 1.
   - NEVER schedule two "hard" intensity sessions on consecutive training days without at least a "moderate", "light", or rest day between them.
7. Do not give medical diagnoses, medication advice, or extreme cutting protocols. If user mentions pain/injury, select joint-friendly variations and note in aiNote.`;
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
${input.lockedConstraints ? `\nLOCKED CONSTRAINTS (do NOT change or overwrite these days/exercises):\n${input.lockedConstraints}\n` : ""}

Allowed exercise names (use these exact names when possible):
${catalog || "(catalog empty — use well-known gym exercise names)"}

JSON shape:
{
  "planTitle": string,
  "daysPerWeek": number,
  "days": [
    {
      "dayName": "Mon",
      "focus": "Push & Core",
      "isRestDay": false,
      "intensityLevel": "moderate",
      "workout": {
        "name": string,
        "durationMinutes": number,
        "muscleGroups": [string],
        "exercises": [{ "name": string, "sets": number, "reps": "8-10", "restSeconds": 90, "aiNote": string }]
      }
    }
  ]
}
Include exactly 7 weekday entries (Mon-Sun). Ensure intensityLevel is set to "light", "moderate", or "hard" for each training day matching the pacing rules above.`;
}
