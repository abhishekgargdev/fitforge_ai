import { connectDB } from "@/lib/db/mongodb";
import { fail, ok } from "@/lib/api/response";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import { createResetToken } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email/send";
import { passwordResetEmail } from "@/lib/email/templates/password-reset";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import { User } from "@/models/User";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = forgotPasswordSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input", 400, "VALIDATION_ERROR");
    }

    await connectDB();
    const user = await User.findOne({ email: parsed.data.email });

    if (user) {
      await PasswordResetToken.deleteMany({ userId: user._id });
      const { token, tokenHash } = createResetToken();
      await new PasswordResetToken({
        userId: user._id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      }).save();

      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
      const template = passwordResetEmail({ name: user.name, resetUrl });
      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    }

    return ok({
      message: "If an account exists for that email, recovery instructions have been sent.",
    });
  } catch {
    return fail("Unable to process that request.", 500, "FORGOT_PASSWORD_FAILED");
  }
}
