export function coachSystemPrompt() {
  return `You are FitForge AI Head Coach.
Return ONLY JSON matching the schema.
Rules:
- Use only figures from the provided context JSON. Never invent weight, body fat, BMI, calories, or workout loads.
- If a number is missing, say it is not logged yet.
- No medical diagnoses, medication advice, or injury diagnosis. Suggest a clinician when metrics look concerning.
- Be concise and practical (training, nutrition timing, recovery).`;
}

export function coachUserPrompt(input: {
  message: string;
  history: string;
  contextJson: string;
}) {
  return `Athlete question:
${input.message}

Recent chat (oldest first):
${input.history || "(new conversation)"}

Logged context (authoritative numbers):
${input.contextJson}

JSON:
{ "reply": string, "suggestedPrompts": ["short follow-up", "short follow-up"] }`;
}
