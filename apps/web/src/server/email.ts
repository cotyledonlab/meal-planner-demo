import nodemailer from 'nodemailer';

const resolvedPort = process.env.SMTP_PORT ? Number.parseInt(process.env.SMTP_PORT, 10) : 1025;
const smtpPort = Number.isNaN(resolvedPort) ? 1025 : resolvedPort;

const fromAddress =
  process.env.SMTP_FROM ??
  (process.env.SMTP_USER ? `MealMind AI <${process.env.SMTP_USER}>` : 'noreply@mealmind.ai');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'mailpit',
  port: smtpPort,
  secure: smtpPort === 465,
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
});

export async function sendPasswordResetEmail(
  email: string,
  name: string | null,
  resetToken: string
) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: fromAddress,
    to: email,
    subject: 'Reset Your MealMind AI Password',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 30px;">
              <h1 style="margin: 0 0 20px; font-size: 28px; font-weight: 700; color: #1a1a1a; text-align: center;">Reset Your Password</h1>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #4a4a4a;">
                Hi${name ? ` ${name}` : ''},
              </p>
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 24px; color: #4a4a4a;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <a href="${resetUrl}" style="display: inline-block; padding: 14px 40px; font-size: 16px; font-weight: 600; color: #ffffff; background-color: #10b981; text-decoration: none; border-radius: 6px;">Reset Password</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 10px; font-size: 14px; line-height: 20px; color: #6b7280;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 30px; font-size: 14px; line-height: 20px; color: #10b981; word-break: break-all;">
                ${resetUrl}
              </p>
              <div style="padding: 20px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b; margin-bottom: 30px;">
                <p style="margin: 0; font-size: 14px; line-height: 20px; color: #92400e;">
                  <strong>This link will expire in 1 hour</strong> for security reasons.
                </p>
              </div>
              <p style="margin: 0; font-size: 14px; line-height: 20px; color: #6b7280;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 14px; line-height: 20px; color: #6b7280; text-align: center;">
                Thanks,<br>The MealMind AI Team
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Hi${name ? ` ${name}` : ''},

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request this, you can safely ignore this email.

Thanks,
The MealMind AI Team`,
  });
}
