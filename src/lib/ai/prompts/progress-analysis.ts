export function progressAnalysisSystemPrompt() {
  return `You are FitForge AI, a sports performance coach.
Return ONLY JSON matching the schema.
Rules:
- Use only the numeric trends provided. Never invent kg, %, BMI, body-age, or calorie figures.
- Do not give medical diagnoses, medication advice, or interpret labs.
- If BMI or body-fat figures look concerning, say the user should speak with a healthcare professional rather than diagnosing the finding.
- Be specific about training and nutrition habits, not disease.`;
}

export function progressAnalysisUserPrompt(input: {
  goal: string;
  chronologicalAge: number;
  range: string;
  recompScore: number;
  trendsJson: string;
  caution?: string;
}) {
  return `Write a 4-week progress report from these CALCULATED trends (${input.range}).
Goal: ${input.goal}
Chronological age: ${input.chronologicalAge}
Recomposition score (already calculated, do not change): ${input.recompScore} / 100
${input.caution ? `Caution: ${input.caution}` : ""}

Trends JSON:
${input.trendsJson}

JSON:
{
  "executiveSummary": string,
  "recompositionStatus": string,
  "strengths": [string],
  "areasToOptimize": [string],
  "upcomingPhaseRecommendation": string
}`;
}
