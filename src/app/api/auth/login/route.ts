import { connectDB } from "@/lib/db/mongodb";
import { fail, ok } from "@/lib/api/response";
import { loginSchema } from "@/lib/validation/auth";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionCookie } from "@/lib/auth/session";
import { User } from "@/models/User";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = loginSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input", 400, "VALIDATION_ERROR");
    }

    await connectDB();
    const user = await User.findOne({ email: parsed.data.email }).select("+passwordHash");
    if (!user?.passwordHash) {
      return fail("Invalid email or password.", 401, "INVALID_CREDENTIALS");
    }

    const matches = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!matches) {
      return fail("Invalid email or password.", 401, "INVALID_CREDENTIALS");
    }

    await createSessionCookie({
      userId: String(user._id),
      email: user.email,
      name: user.name,
      onboardingComplete: user.onboardingComplete,
    });

    return ok({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        onboardingComplete: user.onboardingComplete,
      },
    });
  } catch {
    return fail("Unable to sign in right now.", 500, "LOGIN_FAILED");
  }
}
