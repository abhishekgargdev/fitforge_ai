import mongoose from "mongoose";
import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { toFoodDto } from "@/lib/nutrition/cache";
import { FoodItemModel } from "@/models/FoodItem";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return fail("Food not found.", 404, "FOOD_NOT_FOUND");
    const food = await FoodItemModel.findById(id);
    if (!food) return fail("Food not found.", 404, "FOOD_NOT_FOUND");
    return ok({ food: toFoodDto(food) });
  } catch (error) {
    console.error("[foods:get]", error);
    return fail("Unable to load food.", 500, "FOOD_LOAD_FAILED");
  }
}
