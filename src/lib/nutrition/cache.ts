import type { FoodItem } from "@/types";
import { FoodItemModel } from "@/models/FoodItem";
import { mapUsdaFood, searchUsdaFoods, type UsdaFood } from "@/lib/nutrition/usda";
import {
  getOpenFoodFactsByBarcode,
  mapOffProduct,
  searchOpenFoodFacts,
} from "@/lib/nutrition/openFoodFacts";

export function toFoodDto(doc: {
  _id: { toString(): string };
  name: string;
  servingSize: string;
  servingWeightGrams: number;
  caloriesKcal: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
  category: FoodItem["category"];
  isFavorite?: boolean;
}): FoodItem {
  return {
    id: String(doc._id),
    name: doc.name,
    servingSize: doc.servingSize,
    servingWeightGrams: doc.servingWeightGrams,
    caloriesKcal: doc.caloriesKcal,
    proteinGrams: doc.proteinGrams,
    carbsGrams: doc.carbsGrams,
    fatGrams: doc.fatGrams,
    fiberGrams: doc.fiberGrams ?? 0,
    category: doc.category,
    isFavorite: doc.isFavorite,
  };
}

export async function cacheUsdaFood(food: UsdaFood) {
  const mapped = mapUsdaFood(food);
  const doc = await FoodItemModel.findOneAndUpdate(
    { usdaFdcId: mapped.usdaFdcId },
    { ...mapped, source: "usda" },
    { upsert: true, new: true }
  );
  return doc;
}

export async function cacheOffBarcode(code: string) {
  const existing = await FoodItemModel.findOne({ barcode: code });
  if (existing) return existing;
  const product = await getOpenFoodFactsByBarcode(code);
  if (!product) return null;
  const mapped = mapOffProduct(product, code);
  if (!mapped.barcode) return null;
  return FoodItemModel.findOneAndUpdate(
    { barcode: mapped.barcode },
    { ...mapped, source: "open_food_facts" },
    { upsert: true, new: true }
  );
}

export async function searchAndCacheFoods(query: string) {
  const q = query.trim();
  if (!q) return [];
  const local = await FoodItemModel.find({ name: { $regex: q, $options: "i" } }).limit(20);
  const seen = new Set(local.map((row) => String(row._id)));
  const results = [...local];

  if (/^\d{8,14}$/.test(q)) {
    const barcodeHit = await cacheOffBarcode(q);
    if (barcodeHit && !seen.has(String(barcodeHit._id))) {
      results.unshift(barcodeHit);
      seen.add(String(barcodeHit._id));
    }
  }

  if (results.length < 8) {
    try {
      const usda = await searchUsdaFoods(q, 10);
      for (const food of usda) {
        const cached = await cacheUsdaFood(food);
        if (cached && !seen.has(String(cached._id))) {
          results.push(cached);
          seen.add(String(cached._id));
        }
      }
    } catch (error) {
      console.error("[foods:usda]", error);
    }
  }

  if (results.length < 8) {
    try {
      const off = await searchOpenFoodFacts(q, 6);
      for (const product of off) {
        if (!product.code) continue;
        const cached = await cacheOffBarcode(product.code);
        if (cached && !seen.has(String(cached._id))) {
          results.push(cached);
          seen.add(String(cached._id));
        }
      }
    } catch (error) {
      console.error("[foods:off]", error);
    }
  }

  return results.slice(0, 20);
}

export async function resolveFoodByName(name: string) {
  const local = await FoodItemModel.findOne({
    name: { $regex: name.trim(), $options: "i" },
  });
  if (local) return local;
  const matches = await searchAndCacheFoods(name);
  return matches[0] || null;
}
