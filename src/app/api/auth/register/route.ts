import { connectDB } from "@/lib/db/mongodb";
import { fail, ok } from "@/lib/api/response";
import { registerSchema } from "@/lib/validation/auth";
import { hashPassword } from "@/lib/auth/password";
import { createSessionCookie } from "@/lib/auth/session";
import { User } from "@/models/User";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return fail("Invalid JSON body.", 400, "INVALID_JSON");
  }

  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input", 400, "VALIDATION_ERROR");
  }

  try {
    await connectDB();
    const existing = await User.findOne({ email: parsed.data.email });
    if (existing) {
      return fail("An account with this email already exists.", 409, "EMAIL_TAKEN");
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const user = new User({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      onboardingComplete: false,
    });
    await user.save();

    await createSessionCookie({
      userId: String(user._id),
      email: user.email,
      name: user.name,
      onboardingComplete: false,
    });

    return ok(
      {
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          onboardingComplete: false,
        },
      },
      201
    );
  } catch (error) {
    console.error("[register]", error);
    return fail("Unable to register right now.", 500, "REGISTER_FAILED");
  }
}
