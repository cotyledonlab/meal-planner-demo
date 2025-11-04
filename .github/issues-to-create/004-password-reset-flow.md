# Password reset flow not implemented

**Labels:** enhancement, high-priority, auth, security, feature
**Priority:** P1 - High
**Milestone:** Authentication MVP

## Description

Users have no way to reset their password if they forget it. This is a critical authentication feature for any production application. Currently, users who forget their password are permanently locked out unless they create a new account.

## Current Behavior

1. User forgets password
2. Goes to sign-in page
3. No "Forgot Password?" link available
4. User cannot access their account
5. Only option: Create a new account (losing all data)

## Expected Behavior

### User Flow
1. User clicks "Forgot Password?" on sign-in page
2. Enters email address
3. Receives email with secure reset link
4. Clicks link (validates token, checks expiration)
5. Enters new password (with strength requirements)
6. Confirms new password
7. Password updated successfully
8. Redirected to sign-in page with success message
9. User signs in with new password

### Security Requirements
- Reset tokens must be cryptographically secure
- Tokens expire after 1 hour
- Tokens are single-use only
- Rate limiting on reset requests (max 3 per hour per email)
- No user enumeration (same message for valid/invalid emails)
- Password requirements enforced on reset
- Email contains no sensitive information

## File References

- `docs/AUTH.md:314` - Lists "Password reset flow" as future feature
- `apps/web/src/app/auth/signin/page.tsx` - Missing forgot password link
- `apps/web/src/server/auth/config.ts` - Auth configuration

## Specification Reference

From `docs/AUTH.md`:
```markdown
## Future Enhancements
- Password reset flow
```

## User Stories

**As a** user who forgot my password
**I want to** reset it via email
**So that** I can regain access to my account

**As a** security-conscious user
**I want** reset links to expire quickly
**So that** old emails can't be used to compromise my account

**As an** admin
**I want** rate limiting on password resets
**So that** the system can't be abused for email spam

## Technical Implementation

### Database Schema

Add to Prisma schema:
```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
  used      Boolean  @default(false)
  usedAt    DateTime?

  @@index([token])
  @@index([userId])
}
```

### API Endpoints

**Request Reset**
```typescript
// POST /api/auth/password-reset/request
{
  email: string
}
```

**Verify Token**
```typescript
// GET /api/auth/password-reset/verify?token=xxx
Response: { valid: boolean }
```

**Reset Password**
```typescript
// POST /api/auth/password-reset/reset
{
  token: string,
  password: string
}
```

### Email Template

```html
Subject: Reset Your MealMind AI Password

Hi [Name],

We received a request to reset your password. Click the link below to create a new password:

[Reset Password Button/Link]

This link will expire in 1 hour for security reasons.

If you didn't request this, you can safely ignore this email.

Thanks,
The MealMind AI Team
```

### Implementation Steps

1. **Database Migration**
   - Add PasswordResetToken model
   - Create indexes
   - Run migration

2. **Email Service Setup**
   - Configure SMTP (already setup via Mailpit in dev)
   - Create email template
   - Test email sending

3. **API Routes**
   - Request reset endpoint with rate limiting
   - Token verification endpoint
   - Password reset endpoint with validation
   - Cleanup expired tokens (cron job)

4. **UI Pages**
   - Add "Forgot Password?" link to sign-in page
   - Create request reset page (`/auth/forgot-password`)
   - Create reset password page (`/auth/reset-password`)
   - Add success/error states

5. **Security**
   - Implement rate limiting (max 3 requests/hour/email)
   - Token generation with crypto.randomBytes
   - Validate password strength on reset
   - Prevent user enumeration
   - Log all reset attempts

6. **Testing**
   - Unit tests for token generation
   - Integration tests for all endpoints
   - E2E tests for complete flow
   - Security testing (expired tokens, invalid tokens, rate limiting)

## Security Considerations

### Prevent User Enumeration
```typescript
// Always return same message regardless of email existence
return {
  message: "If an account exists, you'll receive a reset email"
};
```

### Secure Token Generation
```typescript
import crypto from 'crypto';

function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
```

### Rate Limiting
```typescript
// Limit: 3 requests per hour per email
const rateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  keyGenerator: (req) => req.body.email,
});
```

## File Structure

```
apps/web/src/
├── app/
│   └── auth/
│       ├── forgot-password/
│       │   └── page.tsx
│       └── reset-password/
│           └── page.tsx
├── server/
│   ├── api/routers/
│   │   └── passwordReset.ts
│   ├── email/
│   │   ├── templates/
│   │   │   └── password-reset.tsx
│   │   └── sender.ts
│   └── services/
│       └── tokenCleanup.ts
└── prisma/
    └── migrations/
        └── [timestamp]_add_password_reset_token/
```

## Acceptance Criteria

### Functionality
- [ ] "Forgot Password?" link on sign-in page
- [ ] Request reset page with email input
- [ ] Email sent with reset link
- [ ] Reset link opens password reset page
- [ ] New password form with validation
- [ ] Password successfully updated
- [ ] User can sign in with new password
- [ ] Old password no longer works

### Security
- [ ] Tokens expire after 1 hour
- [ ] Tokens are single-use
- [ ] Token validation on reset page
- [ ] Rate limiting prevents spam (3/hour)
- [ ] No user enumeration possible
- [ ] Password requirements enforced
- [ ] Secure token generation
- [ ] All reset attempts logged

### UX
- [ ] Clear instructions at each step
- [ ] Loading states during API calls
- [ ] Success messages shown
- [ ] Error messages are helpful
- [ ] Works on mobile and desktop
- [ ] Accessible via keyboard
- [ ] Screen reader compatible

### Email
- [ ] Email delivers successfully
- [ ] Email contains correct reset link
- [ ] Email is branded and professional
- [ ] Link works from email clients
- [ ] Unsubscribe link included (if required)

## Testing Requirements

- [ ] Unit tests for token generation and validation
- [ ] Unit tests for password hashing
- [ ] Integration tests for all endpoints
- [ ] E2E test for complete flow
- [ ] Test expired token handling
- [ ] Test invalid token handling
- [ ] Test rate limiting
- [ ] Test email delivery
- [ ] Test with valid and invalid emails
- [ ] Security penetration testing

## Dependencies

**Existing:**
- NextAuth.js (authentication framework)
- Nodemailer (email sending - via Mailpit in dev)
- Argon2 (password hashing)

**New:**
- Rate limiting library (e.g., `express-rate-limit` or custom)
- Cron job library for token cleanup (e.g., `node-cron`)

## Configuration

**Environment Variables:**
```env
# Already configured for Mailpit in development
SMTP_HOST=mailpit
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@mealmind.ai

# Production will need real SMTP
# SMTP_HOST=smtp.sendgrid.net
# SMTP_PORT=587
# SMTP_USER=apikey
# SMTP_PASS=<sendgrid-api-key>

# Password reset settings
PASSWORD_RESET_TOKEN_EXPIRY=3600 # 1 hour in seconds
PASSWORD_RESET_RATE_LIMIT=3 # max requests per hour
```

## User Impact

🔴 **Critical for Production**
- Users will forget passwords
- No recovery = permanent lockout
- Creates poor user experience
- Support burden (manual password resets)
- Standard feature in all modern apps

## Rollout Plan

1. **Development** - Test with Mailpit
2. **Staging** - Test with real SMTP (SendGrid/Postmark)
3. **Production** - Enable with monitoring
4. **Monitor** - Track reset request volume and success rate

## Future Enhancements

- [ ] Password reset from user settings page
- [ ] 2FA integration with reset flow
- [ ] Account recovery via security questions
- [ ] SMS-based reset option
- [ ] Magic link sign-in (passwordless)
- [ ] Password strength indicator
- [ ] Breach detection (HaveIBeenPwned API)
- [ ] Email notification when password is changed

## Related Issues

- #1 - Password security (cleartext transmission)
- #14 - Email verification (same email infrastructure)
- #15 - User settings page (change password feature)
