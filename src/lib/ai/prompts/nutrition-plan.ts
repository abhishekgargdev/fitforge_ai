export function nutritionPlanSystemPrompt() {
  return `You are FitForge AI, a sports nutrition coach.
Return ONLY JSON matching the schema.
Rules:
- Propose ordinary grocery foods by name/description only.
- Never invent calories, macros, micronutrients, or supplement doses.
- Do not include numbers for kcal/protein/carbs/fat. Those are resolved from a food database.
- No medical diagnoses, medication advice, or extreme crash diets.
- Respect allergies and exclusions exactly.`;
}

export function nutritionPlanUserPrompt(input: {
  goal: string;
  dietType: string;
  targetCalories: number;
  targetProteinGrams?: number;
  targetCarbsGrams?: number;
  targetFatGrams?: number;
  mealsCount: number;
  preferences: string;
  allergies: string;
  budget: string;
  cuisine: string;
}) {
  return `Create a ${input.mealsCount}-meal daily template.
Goal: ${input.goal}
Diet pattern: ${input.dietType}
Calorie target (guidance only, do not output numbers): ${input.targetCalories}
Macro guidance (do not output numbers): P ${input.targetProteinGrams ?? "n/a"} / C ${input.targetCarbsGrams ?? "n/a"} / F ${input.targetFatGrams ?? "n/a"}
Budget: ${input.budget}
Cuisine: ${input.cuisine || "no preference"}
Allergies: ${input.allergies || "none"}
Preferences: ${input.preferences || "none"}

JSON:
{
  "planTitle": string,
  "meals": [{ "mealName": string, "mealCategory": "breakfast|lunch|dinner|snack", "foods": ["food name", "food name"] }],
  "groceryList": ["item"]
}`;
}
