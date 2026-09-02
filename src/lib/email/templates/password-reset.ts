export function passwordResetEmail(input: { name: string; resetUrl: string }) {
  const year = new Date().getFullYear();
  const text = `Hi ${input.name},

We received a request to reset your FitForge AI password.

Open this link to choose a new password (valid for 60 minutes):
${input.resetUrl}

If you did not request this, you can ignore this email. Your password will stay the same.

— The FitForge AI team`;

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset your FitForge AI password</title>
  </head>
  <body style="margin:0;padding:0;background-color:#0B0D0F;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#0B0D0F;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;background-color:#12161A;border:1px solid #252B30;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px;background-color:#181D22;border-bottom:1px solid #252B30;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;color:#F5F7F2;">
                      FitForge <span style="color:#B8F34A;">AI</span>
                    </td>
                    <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#9AA3A0;">
                      Account security
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 12px 32px;font-family:Arial,Helvetica,sans-serif;color:#F5F7F2;">
                <p style="margin:0 0 8px 0;font-size:13px;color:#B8F34A;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Password reset</p>
                <h1 style="margin:0 0 16px 0;font-size:24px;line-height:1.3;color:#FFFFFF;">Reset your password</h1>
                <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#9AA3A0;">
                  Hi ${escapeHtml(input.name)},
                </p>
                <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#9AA3A0;">
                  We received a request to reset the password for your FitForge AI account. Use the button below to choose a new password. This link expires in <strong style="color:#F5F7F2;">60 minutes</strong>.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:0 32px 28px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" bgcolor="#B8F34A" style="border-radius:10px;">
                      <a href="${escapeAttr(input.resetUrl)}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#0B0D0F;text-decoration:none;letter-spacing:0.04em;">
                        Choose a new password
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 28px 32px;font-family:Arial,Helvetica,sans-serif;">
                <p style="margin:0 0 8px 0;font-size:12px;color:#9AA3A0;">If the button does not work, paste this URL into your browser:</p>
                <p style="margin:0;font-size:12px;line-height:1.5;word-break:break-all;color:#5DA9FF;">${escapeHtml(input.resetUrl)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px 32px;font-family:Arial,Helvetica,sans-serif;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#181D22;border:1px solid #252B30;border-radius:12px;">
                  <tr>
                    <td style="padding:16px 18px;font-size:13px;line-height:1.6;color:#9AA3A0;">
                      If you did not request a password reset, no action is needed. Your password will remain unchanged and this link will expire automatically.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#0B0D0F;border-top:1px solid #252B30;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#9AA3A0;">
                © ${year} FitForge AI. This message was sent to the email on your account.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject: "Reset your FitForge AI password", html, text };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(value: string) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}
