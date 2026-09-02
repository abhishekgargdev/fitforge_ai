import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { searchAndCacheFoods, toFoodDto } from "@/lib/nutrition/cache";

export async function GET(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const q = new URL(request.url).searchParams.get("q") || "";
    if (q.trim().length < 2) return ok({ items: [] });
    const rows = await searchAndCacheFoods(q);
    return ok({ items: rows.map(toFoodDto) });
  } catch (error) {
    console.error("[foods:search]", error);
    return fail("Unable to search foods.", 500, "FOOD_SEARCH_FAILED");
  }
}
