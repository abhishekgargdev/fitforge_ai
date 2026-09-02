import type { FoodItem } from "@/types";

type UsdaNutrient = {
  nutrientNumber?: string;
  nutrientId?: number;
  value?: number;
  amount?: number;
  nutrient?: { number?: string; id?: number; name?: string };
};

export type UsdaFood = {
  fdcId: number;
  description?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
  foodNutrients?: UsdaNutrient[];
  foodCategory?: string;
  brandName?: string;
};

type UsdaSearchResponse = {
  foods?: UsdaFood[];
};

function nutrientValue(food: UsdaFood, numbers: string[]) {
  const row = (food.foodNutrients || []).find((n) => {
    const num = String(n.nutrientNumber || n.nutrient?.number || "");
    return numbers.includes(num);
  });
  return Number(row?.value ?? row?.amount ?? 0);
}

function guessCategory(name: string): FoodItem["category"] {
  const lower = name.toLowerCase();
  if (/chicken|beef|fish|egg|turkey|protein|whey|tofu|salmon/.test(lower)) return "Protein";
  if (/rice|oat|bread|pasta|potato|quinoa/.test(lower)) return "Carb";
  if (/oil|butter|avocado|almond|peanut/.test(lower)) return "Fat";
  if (/yogurt|milk|cheese/.test(lower)) return "Dairy";
  if (/apple|berry|broccoli|spinach|banana|vegetable/.test(lower)) return "Produce";
  return "Snack";
}

export function mapUsdaFood(food: UsdaFood): Omit<FoodItem, "id"> & { usdaFdcId: string } {
  const grams = food.servingSize && food.servingSizeUnit?.toLowerCase() === "g" ? food.servingSize : 100;
  const scale = grams / 100;
  const calories = Math.round(nutrientValue(food, ["208"]) * scale);
  const protein = round1(nutrientValue(food, ["203"]) * scale);
  const carbs = round1(nutrientValue(food, ["205"]) * scale);
  const fat = round1(nutrientValue(food, ["204"]) * scale);
  const fiber = round1(nutrientValue(food, ["291"]) * scale);
  const name = [food.brandName, food.description].filter(Boolean).join(" ").trim();
  return {
    name: name || `FDC ${food.fdcId}`,
    servingSize: food.householdServingFullText || `${grams} g`,
    servingWeightGrams: grams,
    caloriesKcal: calories,
    proteinGrams: protein,
    carbsGrams: carbs,
    fatGrams: fat,
    fiberGrams: fiber,
    category: guessCategory(name),
    usdaFdcId: String(food.fdcId),
  };
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

export async function searchUsdaFoods(query: string, pageSize = 12) {
  const key = process.env.USDA_FDC_API_KEY;
  if (!key || !query.trim()) return [];
  const res = await fetch(
    `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: query.trim(),
        pageSize,
        dataType: ["Foundation", "SR Legacy", "Survey (FNDDS)", "Branded"],
      }),
    }
  );
  if (!res.ok) throw new Error(`USDA search failed (${res.status})`);
  const json = (await res.json()) as UsdaSearchResponse;
  return json.foods || [];
}

export async function getUsdaFood(fdcId: string) {
  const key = process.env.USDA_FDC_API_KEY;
  if (!key) return null;
  const res = await fetch(
    `https://api.nal.usda.gov/fdc/v1/food/${encodeURIComponent(fdcId)}?api_key=${encodeURIComponent(key)}`
  );
  if (!res.ok) return null;
  return (await res.json()) as UsdaFood;
}
