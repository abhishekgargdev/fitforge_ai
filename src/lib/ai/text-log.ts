import { generateStructuredJson } from "@/lib/ai/orchestrator";
import { textFoodExtractSystemPrompt, textFoodExtractUserPrompt } from "@/lib/ai/prompts/food-log";
import { extractedFoodLogSchema, type ExtractedFoodLog } from "@/lib/ai/schemas/food-log";
import { resolveFoodByName } from "@/lib/nutrition/cache";
import { FoodItemModel } from "@/models/FoodItem";
import { FoodLogModel } from "@/models/FoodLog";

function todayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export type TextFoodLogResult = {
  isFoodLog: boolean;
  confirmationText?: string;
  loggedEntries: Array<{
    name: string;
    mealCategory: string;
    caloriesKcal: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  }>;
};

export async function foodLogFromText(input: {
  userId: unknown;
  message: string;
  history?: string;
}): Promise<TextFoodLogResult> {
  let extracted: ExtractedFoodLog;
  try {
    extracted = await generateStructuredJson({
      system: textFoodExtractSystemPrompt(),
      user: textFoodExtractUserPrompt(input.message, input.history),
      schema: extractedFoodLogSchema,
    });
  } catch (error) {
    console.error("[ai:foodLogFromText] Extraction failed:", error);
    return { isFoodLog: false, loggedEntries: [] };
  }

  if (!extracted.isFoodLog || !extracted.items.length) {
    return { isFoodLog: false, loggedEntries: [] };
  }

  const date = todayDateString();

  // If this is a correction, remove/update previous ai_chat entries from today to avoid duplicates
  if (extracted.isCorrection) {
    await FoodLogModel.deleteMany({
      userId: input.userId,
      date,
      source: "ai_chat",
    });
  }

  const loggedEntries = [];
  let totalKcal = 0;
  let totalProtein = 0;

  for (const item of extracted.items) {
    // Phase 6 resolution pipeline: Resolve against local foodItems / USDA / Open Food Facts
    const food = await resolveFoodByName(item.foodDescription);

    let snapshot = {
      foodItemId: food ? String(food._id) : undefined,
      name: food ? food.name : item.foodDescription,
      serving: item.estimatedQuantity || (food ? food.servingSize : "1 serving"),
      grams: food ? food.servingWeightGrams : 100,
      caloriesKcal: food ? food.caloriesKcal : 200,
      proteinGrams: food ? food.proteinGrams : 10,
      carbsGrams: food ? food.carbsGrams : 25,
      fatGrams: food ? food.fatGrams : 5,
      fiberGrams: food ? (food.fiberGrams || 0) : 2,
    };

    if (!food) {
      // Create custom FoodItem if not found in catalog/USDA/OFF
      const custom = await FoodItemModel.create({
        name: item.foodDescription,
        servingSize: item.estimatedQuantity || "1 serving",
        servingWeightGrams: 100,
        caloriesKcal: snapshot.caloriesKcal,
        proteinGrams: snapshot.proteinGrams,
        carbsGrams: snapshot.carbsGrams,
        fatGrams: snapshot.fatGrams,
        fiberGrams: snapshot.fiberGrams,
        category: "Snack",
        source: "custom",
      });
      snapshot.foodItemId = String(custom._id);
    }

    const created = await FoodLogModel.create({
      userId: input.userId,
      foodItemId: snapshot.foodItemId,
      name: snapshot.name,
      serving: snapshot.serving,
      mealCategory: item.meal,
      grams: snapshot.grams,
      caloriesKcal: snapshot.caloriesKcal,
      proteinGrams: snapshot.proteinGrams,
      carbsGrams: snapshot.carbsGrams,
      fatGrams: snapshot.fatGrams,
      fiberGrams: snapshot.fiberGrams,
      source: "ai_chat",
      date,
    });

    loggedEntries.push({
      name: created.name,
      mealCategory: created.mealCategory,
      caloriesKcal: created.caloriesKcal,
      proteinGrams: created.proteinGrams,
      carbsGrams: created.carbsGrams,
      fatGrams: created.fatGrams,
    });

    totalKcal += created.caloriesKcal;
    totalProtein += created.proteinGrams;
  }

  const itemsDesc = loggedEntries.map((e) => `${e.name} (${e.mealCategory})`).join(", ");
  const confirmationText = `Logged ${itemsDesc} — about ${Math.round(totalKcal)} kcal, ${Math.round(totalProtein * 10) / 10}g protein. (You can reply to adjust portions anytime, e.g. "no, 3 chapati")`;

  return {
    isFoodLog: true,
    confirmationText,
    loggedEntries,
  };
}
