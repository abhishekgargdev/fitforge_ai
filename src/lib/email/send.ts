import nodemailer from "nodemailer";

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendEmail(input: { to: string; subject: string; html: string; text: string }) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "FitForge AI <noreply@fitforge.ai>";
  const transporter = createTransport();

  if (!transporter) {
    console.info("[email:dev]", { to: input.to, subject: input.subject, text: input.text });
    return { skipped: true as const };
  }

  await transporter.sendMail({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  return { skipped: false as const };
}
