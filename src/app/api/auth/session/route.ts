import { fail, ok } from "@/lib/api/response";
import { readSessionToken } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/mongodb";
import { User } from "@/models/User";

export async function GET() {
  try {
    const token = await readSessionToken();
    if (!token) {
      return ok({ user: null });
    }

    await connectDB();
    const user = await User.findById(token.userId);
    if (!user) {
      return ok({ user: null });
    }

    return ok({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        onboardingComplete: user.onboardingComplete,
      },
    });
  } catch {
    return fail("Unable to load session.", 500, "SESSION_FAILED");
  }
}
