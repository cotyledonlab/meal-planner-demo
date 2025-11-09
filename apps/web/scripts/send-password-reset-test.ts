#!/usr/bin/env node
import process from 'node:process';

import { resolveSmtpConfig, sendPasswordResetEmail } from '../src/server/email';

function parseArgs(argv: string[]) {
  const args = {
    to: undefined as string | undefined,
    name: 'SMTP Smoke Test',
  };

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    if (arg === '--') {
      continue;
    }

    if (arg.startsWith('--to=')) {
      args.to = arg.slice('--to='.length);
      continue;
    }

    if (arg.startsWith('--name=')) {
      args.name = arg.slice('--name='.length);
      continue;
    }

    console.warn(`Ignoring unrecognized argument: ${arg}`);
  }

  return args;
}

function printHelp() {
  console.log(`Usage: pnpm --filter @meal-planner-demo/web email:test -- --to=user@example.com [--name="Recipient Name"]

Sends a password reset email using the current SMTP configuration. Useful for verifying
production credentials after updating Dokploy secrets.

Options:
  --to=<email>       Email address to send the password reset link to (required)
  --name=<string>    Friendly recipient name used in the email body (optional)
  -h, --help         Show this help message
`);
}

async function main() {
  const { to, name } = parseArgs(process.argv.slice(2));

  if (!to) {
    console.error('Missing required argument: --to=<email>');
    printHelp();
    process.exit(1);
  }

  const config = resolveSmtpConfig();

  const token = `smoke-test-${Date.now()}`;
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const resetUrl = `${baseUrl.replace(/\/$/, '')}/auth/reset-password?token=${token}`;

  console.log('Sending password reset smoke test email...');
  console.log(`  Host: ${config.host}:${config.port}`);
  console.log(`  From: ${config.from}`);
  console.log(`  To:   ${to}`);

  await sendPasswordResetEmail(to, name, token);

  console.log('Password reset email sent successfully.');
  console.log(`Test reset URL (expires in 1 hour): ${resetUrl}`);
  console.log('Use this command again if you need to trigger another delivery.');
}

main().catch((error) => {
  console.error('Failed to send test password reset email.');
  console.error(error);
  process.exit(1);
});
