import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { buildProgressSeries, measurementsInRange } from "@/lib/progress/series";
import { progressQuerySchema } from "@/lib/validation/progress";

export async function GET(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const parsed = progressQuerySchema.safeParse(
      Object.fromEntries(new URL(request.url).searchParams)
    );
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid query", 400, "VALIDATION_ERROR");
    }
    const { metric, range } = parsed.data;
    const rows = await measurementsInRange(session.user._id, range);
    return ok({
      ...buildProgressSeries(rows, metric),
      range,
    });
  } catch (error) {
    console.error("[progress:get]", error);
    return fail("Unable to load progress series.", 500, "PROGRESS_LOAD_FAILED");
  }
}
