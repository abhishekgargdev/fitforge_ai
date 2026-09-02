export function textFoodExtractSystemPrompt() {
  return `You are FitForge AI's precision food logging parser.
Analyze the user's chat message to detect if they are reporting food/drink consumption or correcting a previously logged food quantity.

Rules:
1. Return JSON with:
   - "isFoodLog": boolean (true if user describes eating/drinking or correcting food)
   - "isCorrection": boolean (true if message is a follow-up correction like "no, 3 chapati", "actually 2 eggs", "it was 300g rice")
   - "items": list of { "foodDescription": string, "estimatedQuantity": string, "meal": "breakfast" | "lunch" | "dinner" | "snack" }
2. Infer meal category from explicit mentions ("for breakfast", "had lunch", "dinner") or default to "snack".
3. Extract clean food descriptions (e.g., "chapati", "yellow dal", "whey protein", "chicken breast").`;
}

export function textFoodExtractUserPrompt(message: string, history?: string) {
  return `User Message: "${message}"
Recent Conversation Context:
${history || "None"}

Extract any reported foods, quantities, and meal categories in JSON format.`;
}

export function foodImageVisionSystemPrompt() {
  return `You are FitForge AI's computer vision nutrition expert.
Analyze the provided food photograph to identify food items, estimate portion size/weight in grams, and provide realistic macronutrient estimates (calories, protein, carbs, fat, fiber).

Rules:
1. Return JSON matching:
   {
     "identifiedFoods": [
       {
         "foodName": string,
         "estimatedQuantity": string,
         "estimatedGrams": number,
         "caloriesKcal": number,
         "proteinGrams": number,
         "carbsGrams": number,
         "fatGrams": number,
         "fiberGrams": number,
         "mealCategory": "breakfast" | "lunch" | "dinner" | "snack"
       }
     ],
     "confidenceSummary": string
   }
2. Provide reasonable, realistic estimates based on visual features and standard portion sizes.
3. Be specific with food names (e.g., "Grilled Salmon Fillet", "Steamed White Rice", "Mixed Green Salad with Olive Oil").`;
}

export function foodImageVisionUserPrompt(mealCategory?: string) {
  return `Identify the food items present in this photo and estimate their serving size and nutritional content for ${mealCategory || "a meal"}.`;
}
