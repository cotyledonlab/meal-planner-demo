import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

type EmailEnvInput = {
  NODE_ENV?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_FROM?: string;
};

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  auth?: {
    user: string;
    pass: string;
  };
  from: string;
};

function parsePort(port: string | undefined): number | undefined {
  if (!port) return undefined;

  const parsed = Number.parseInt(port, 10);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error(`Invalid SMTP_PORT value "${port}". Provide an integer between 1 and 65535.`);
  }

  return parsed;
}

export function resolveSmtpConfig(emailEnv: EmailEnvInput = process.env): SmtpConfig {
  const nodeEnv = emailEnv.NODE_ENV ?? 'development';
  const isProduction = nodeEnv === 'production';

  const host = emailEnv.SMTP_HOST ?? (isProduction ? undefined : 'mailpit');
  if (!host) {
    throw new Error(
      'SMTP_HOST must be configured when NODE_ENV=production. Set SMTP_HOST=mailpit for local Docker usage.'
    );
  }

  const port = parsePort(emailEnv.SMTP_PORT ?? (isProduction ? undefined : '1025'));
  if (port === undefined) {
    throw new Error(
      'SMTP_PORT must be configured when NODE_ENV=production. Use 587 for Mailersend.'
    );
  }

  const user = emailEnv.SMTP_USER;
  const pass = emailEnv.SMTP_PASS;

  if (isProduction && (!user || !pass)) {
    throw new Error('SMTP_USER and SMTP_PASS must be configured when NODE_ENV=production.');
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
    from: emailEnv.SMTP_FROM ?? user ?? 'noreply@mealmind.ai',
  };
}

let cachedConfig: SmtpConfig | null = null;
let cachedTransporter: Transporter | null = null;

function getSmtpConfig(): SmtpConfig {
  if (cachedConfig) return cachedConfig;

  cachedConfig = resolveSmtpConfig();
  return cachedConfig;
}

function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  const config = getSmtpConfig();
  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  return cachedTransporter;
}

export async function sendPasswordResetEmail(
  email: string,
  name: string | null,
  resetToken: string
) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
  const config = getSmtpConfig();
  const transporter = getTransporter();

  await transporter.sendMail({
    from: config.from,
    to: email,
    subject: 'Reset Your Password – MealMind AI',
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
                We received a request to reset your password. Click the button below to create a new one and get back to planning delicious meals!
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
                If you didn't request this, you can safely ignore this email. Your password won't be changed.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 14px; line-height: 20px; color: #6b7280; text-align: center;">
                Happy meal planning! ❤️<br>The MealMind AI Team
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

We received a request to reset your password. Click the link below to create a new one and get back to planning delicious meals!

${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request this, you can safely ignore this email. Your password won't be changed.

Happy meal planning! ❤️
The MealMind AI Team`,
  });
}
