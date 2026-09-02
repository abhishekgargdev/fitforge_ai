import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { buildProgressSummary, measurementsInRange } from "@/lib/progress/series";
import { progressSummaryQuerySchema } from "@/lib/validation/progress";

export async function GET(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const parsed = progressSummaryQuerySchema.safeParse(
      Object.fromEntries(new URL(request.url).searchParams)
    );
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid query", 400, "VALIDATION_ERROR");
    }
    const rows = await measurementsInRange(session.user._id, parsed.data.range);
    return ok({
      range: parsed.data.range,
      ...buildProgressSummary(rows),
    });
  } catch (error) {
    console.error("[progress:summary]", error);
    return fail("Unable to load progress summary.", 500, "PROGRESS_SUMMARY_FAILED");
  }
}
