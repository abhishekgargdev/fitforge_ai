import type { FoodItem } from "@/types";

type OffProduct = {
  code?: string;
  product_name?: string;
  generic_name?: string;
  serving_size?: string;
  serving_quantity?: number;
  nutriments?: Record<string, number>;
};

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function guessCategory(name: string): FoodItem["category"] {
  const lower = name.toLowerCase();
  if (/chicken|beef|fish|egg|protein|whey|tofu/.test(lower)) return "Protein";
  if (/rice|oat|bread|pasta|cereal/.test(lower)) return "Carb";
  if (/oil|butter|nut|avocado/.test(lower)) return "Fat";
  if (/yogurt|milk|cheese/.test(lower)) return "Dairy";
  if (/fruit|vegetable|salad/.test(lower)) return "Produce";
  return "Snack";
}

const headers = {
  "User-Agent": "FitForgeAI/1.0 (nutrition@fitforge.local)",
};

export function mapOffProduct(product: OffProduct, barcode?: string) {
  const grams = product.serving_quantity && product.serving_quantity > 0 ? product.serving_quantity : 100;
  const scale = grams / 100;
  const n = product.nutriments || {};
  const calories100 = n["energy-kcal_100g"] ?? n["energy-kcal"] ?? 0;
  const protein100 = n.proteins_100g ?? n.proteins ?? 0;
  const carbs100 = n.carbohydrates_100g ?? n.carbohydrates ?? 0;
  const fat100 = n.fat_100g ?? n.fat ?? 0;
  const fiber100 = n.fiber_100g ?? n.fiber ?? 0;
  const name = product.product_name || product.generic_name || `Barcode ${barcode || product.code}`;
  return {
    name,
    servingSize: product.serving_size || `${grams} g`,
    servingWeightGrams: grams,
    caloriesKcal: Math.round(calories100 * scale),
    proteinGrams: round1(protein100 * scale),
    carbsGrams: round1(carbs100 * scale),
    fatGrams: round1(fat100 * scale),
    fiberGrams: round1(fiber100 * scale),
    category: guessCategory(name),
    barcode: String(barcode || product.code || ""),
  };
}

export async function getOpenFoodFactsByBarcode(code: string) {
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`, {
    headers,
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { status?: number; product?: OffProduct };
  if (!json.product) return null;
  return json.product;
}

export async function searchOpenFoodFacts(query: string, pageSize = 8) {
  const url = new URL("https://world.openfoodfacts.org/cgi/search.pl");
  url.searchParams.set("search_terms", query);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", String(pageSize));
  const res = await fetch(url, { headers });
  if (!res.ok) return [];
  const json = (await res.json()) as { products?: OffProduct[] };
  return json.products || [];
}
