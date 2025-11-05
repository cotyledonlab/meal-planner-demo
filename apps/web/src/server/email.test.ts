import { describe, expect, it } from 'vitest';
import { resolveSmtpConfig } from './email';

describe('resolveSmtpConfig', () => {
  it('falls back to Mailpit defaults during development', () => {
    const config = resolveSmtpConfig({
      NODE_ENV: 'development',
    });

    expect(config).toEqual({
      host: 'mailpit',
      port: 1025,
      secure: false,
      auth: undefined,
      from: 'noreply@mealmind.ai',
    });
  });

  it('allows overriding the from address when provided', () => {
    const config = resolveSmtpConfig({
      NODE_ENV: 'development',
      SMTP_FROM: 'Custom <test@example.com>',
    });

    expect(config.from).toBe('Custom <test@example.com>');
  });

  it('requires full SMTP configuration in production', () => {
    const config = resolveSmtpConfig({
      NODE_ENV: 'production',
      SMTP_HOST: 'smtp.mailersend.net',
      SMTP_PORT: '587',
      SMTP_USER: 'smtp-user',
      SMTP_PASS: 'smtp-pass',
    });

    expect(config).toMatchObject({
      host: 'smtp.mailersend.net',
      port: 587,
      secure: false,
      auth: {
        user: 'smtp-user',
        pass: 'smtp-pass',
      },
      from: 'smtp-user',
    });
  });

  it('throws when required production values are missing', () => {
    expect(() =>
      resolveSmtpConfig({
        NODE_ENV: 'production',
      })
    ).toThrow(/SMTP_HOST/);

    expect(() =>
      resolveSmtpConfig({
        NODE_ENV: 'production',
        SMTP_HOST: 'smtp.mailersend.net',
        SMTP_PORT: '587',
      })
    ).toThrow(/SMTP_USER/);
  });

  it('validates the SMTP port', () => {
    expect(() =>
      resolveSmtpConfig({
        NODE_ENV: 'production',
        SMTP_HOST: 'smtp.mailersend.net',
        SMTP_PORT: 'not-a-number',
        SMTP_USER: 'user',
        SMTP_PASS: 'pass',
      })
    ).toThrow(/SMTP_PORT/);

    expect(() =>
      resolveSmtpConfig({
        NODE_ENV: 'production',
        SMTP_HOST: 'smtp.mailersend.net',
        SMTP_PORT: '70000',
        SMTP_USER: 'user',
        SMTP_PASS: 'pass',
      })
    ).toThrow(/SMTP_PORT/);
  });
});
