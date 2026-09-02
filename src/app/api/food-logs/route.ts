import mongoose from "mongoose";
import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { foodLogCreateSchema } from "@/lib/validation/nutrition";
import { toLogDto, todayDate } from "@/lib/nutrition/map";
import { FoodItemModel } from "@/models/FoodItem";
import { FoodLogModel } from "@/models/FoodLog";

export async function GET(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const url = new URL(request.url);
    const date = url.searchParams.get("date");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const filter: Record<string, unknown> = { userId: session.user._id };
    if (from || to) {
      filter.date = {
        ...(from ? { $gte: from } : {}),
        ...(to ? { $lte: to } : {}),
      };
    } else {
      filter.date = todayDate(date || undefined);
    }
    const pageParam = url.searchParams.get("page");
    const limitParam = url.searchParams.get("limit");
    if (pageParam || limitParam) {
      const page = Math.max(1, parseInt(pageParam || "1", 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(limitParam || "20", 10) || 20));
      const skip = (page - 1) * limit;
      const [rows, total] = await Promise.all([
        FoodLogModel.find(filter).sort({ loggedAt: 1 }).skip(skip).limit(limit),
        FoodLogModel.countDocuments(filter),
      ]);
      return ok({
        items: rows.map(toLogDto),
        pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      });
    }
    const rows = await FoodLogModel.find(filter).sort({ loggedAt: 1 });
    return ok({ items: rows.map(toLogDto) });
  } catch (error) {
    console.error("[food-logs:list]", error);
    return fail("Unable to load food logs.", 500, "FOOD_LOGS_LOAD_FAILED");
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const parsed = foodLogCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input", 400, "VALIDATION_ERROR");
    }
    const body = parsed.data;
    let snapshot = {
      name: body.name,
      caloriesKcal: body.caloriesKcal ?? 0,
      proteinGrams: body.proteinGrams ?? 0,
      carbsGrams: body.carbsGrams ?? 0,
      fatGrams: body.fatGrams ?? 0,
      fiberGrams: body.fiberGrams ?? 0,
      serving: body.serving,
      grams: body.grams ?? 0,
      foodItemId: undefined as string | undefined,
    };

    if (body.foodId) {
      if (!mongoose.isValidObjectId(body.foodId)) {
        return fail("Food not found.", 404, "FOOD_NOT_FOUND");
      }
      const food = await FoodItemModel.findById(body.foodId);
      if (!food) return fail("Food not found.", 404, "FOOD_NOT_FOUND");
      const servings = body.servings || 1;
      snapshot = {
        name: food.name,
        caloriesKcal: Math.round(food.caloriesKcal * servings),
        proteinGrams: Math.round(food.proteinGrams * servings * 10) / 10,
        carbsGrams: Math.round(food.carbsGrams * servings * 10) / 10,
        fatGrams: Math.round(food.fatGrams * servings * 10) / 10,
        fiberGrams: Math.round((food.fiberGrams || 0) * servings * 10) / 10,
        serving: `${servings} × ${food.servingSize}`,
        grams: Math.round(food.servingWeightGrams * servings),
        foodItemId: String(food._id),
      };
    } else if (snapshot.caloriesKcal === 0 && !body.caloriesKcal) {
      return fail("Provide foodId or nutrition values.", 400, "VALIDATION_ERROR");
    } else {
      const custom = await FoodItemModel.create({
        name: body.name,
        servingSize: body.serving,
        servingWeightGrams: body.grams || 100,
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
      userId: session.user._id,
      foodItemId: snapshot.foodItemId,
      name: snapshot.name,
      serving: snapshot.serving,
      mealCategory: body.mealCategory,
      grams: snapshot.grams,
      caloriesKcal: snapshot.caloriesKcal,
      proteinGrams: snapshot.proteinGrams,
      carbsGrams: snapshot.carbsGrams,
      fatGrams: snapshot.fatGrams,
      fiberGrams: snapshot.fiberGrams,
      loggedAt: new Date(),
      date: todayDate(body.date),
    });
    return ok({ log: toLogDto(created) }, 201);
  } catch (error) {
    console.error("[food-logs:create]", error);
    return fail("Unable to log food.", 500, "FOOD_LOG_CREATE_FAILED");
  }
}
