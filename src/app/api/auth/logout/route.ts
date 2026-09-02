import { fail, ok } from "@/lib/api/response";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST() {
  try {
    await clearSessionCookie();
    return ok({ signedOut: true });
  } catch {
    return fail("Unable to sign out.", 500, "LOGOUT_FAILED");
  }
}
