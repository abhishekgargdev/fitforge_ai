export function workoutPlanSystemPrompt() {
  return `You are FitForge AI, a strength-and-hypertrophy coach.
Return ONLY valid JSON matching the provided schema.
Rules:
- Propose exercises by common training names only. Never invent exercise IDs.
- Prefer names from the allowed exercise list when one is provided.
- Rest days must set isRestDay true and omit workout or leave exercises empty.
- Training days must include 4 to 6 compound and isolation movements.
- Do not give medical diagnoses, medication advice, or extreme cutting protocols.
- If a user mentions pain or injury, choose joint-friendly variations and note that in aiNote, and suggest seeing a clinician rather than diagnosing.`;
}

export function workoutPlanUserPrompt(input: {
  goal: string;
  daysPerWeek: number;
  duration: number;
  experience: string;
  equipment: string[];
  focusMuscles: string[];
  preferences: string;
  catalog: string[];
}) {
  const catalog = input.catalog.slice(0, 80).join(", ");
  return `Build a ${input.daysPerWeek}-day weekly split (${input.duration} minutes per session).
Goal: ${input.goal}
Experience: ${input.experience}
Equipment: ${input.equipment.join(", ") || "full gym"}
Focus muscles: ${input.focusMuscles.join(", ") || "balanced physique"}
Preferences: ${input.preferences || "none"}

Allowed exercise names (use these exact names when possible):
${catalog || "(catalog empty — use well-known gym exercise names)"}

JSON shape:
{
  "planTitle": string,
  "daysPerWeek": number,
  "days": [
    {
      "dayName": "Mon",
      "focus": "Push",
      "isRestDay": false,
      "workout": {
        "name": string,
        "durationMinutes": number,
        "muscleGroups": [string],
        "exercises": [{ "name": string, "sets": number, "reps": "8-10", "restSeconds": 90, "aiNote": string }]
      }
    }
  ]
}
Include exactly 7 weekday entries (Mon-Sun). Rest days: isRestDay true.`;
}
