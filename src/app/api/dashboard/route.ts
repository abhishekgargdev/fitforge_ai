import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/dashboard/compose";
import { progressRangeSchema } from "@/lib/validation/progress";

export async function GET(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const rangeRaw = new URL(request.url).searchParams.get("range") || "3m";
    const parsed = progressRangeSchema.safeParse(rangeRaw);
    const range = parsed.success ? parsed.data : "3m";
    const data = await getDashboardData(session.user._id, range);
    return ok(data);
  } catch (error) {
    console.error("[dashboard]", error);
    return fail("Unable to load dashboard.", 500, "DASHBOARD_LOAD_FAILED");
  }
}
