import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { aggregateAiUsage } from "@/lib/ai/usage";

export async function GET() {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const usage = await aggregateAiUsage(session.user._id);
    return ok(usage);
  } catch (error) {
    console.error("[ai:usage]", error);
    return fail("Unable to load usage.", 500, "USAGE_LOAD_FAILED");
  }
}
