import { connectDB } from "@/lib/db/mongodb";
import { fail, ok } from "@/lib/api/response";
import { resetPasswordSchema } from "@/lib/validation/auth";
import { hashPassword } from "@/lib/auth/password";
import { hashResetToken } from "@/lib/auth/session";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import { User } from "@/models/User";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = resetPasswordSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input", 400, "VALIDATION_ERROR");
    }

    await connectDB();
    const tokenHash = hashResetToken(parsed.data.token);
    const record = await PasswordResetToken.findOne({ tokenHash });

    if (!record || record.expiresAt.getTime() < Date.now()) {
      return fail("This reset link is invalid or has expired.", 400, "INVALID_RESET_TOKEN");
    }

    const passwordHash = await hashPassword(parsed.data.password);
    await User.findByIdAndUpdate(record.userId, { passwordHash });
    await PasswordResetToken.deleteMany({ userId: record.userId });

    return ok({ message: "Password updated. You can sign in now." });
  } catch {
    return fail("Unable to reset password.", 500, "RESET_PASSWORD_FAILED");
  }
}
