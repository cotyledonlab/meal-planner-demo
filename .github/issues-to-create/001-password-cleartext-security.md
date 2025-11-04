# [SECURITY] Password sent in cleartext after signup

**Labels:** security, critical, bug
**Priority:** P0 - Critical
**Assignee:** To be determined

## Description

After user signup, the password is sent in cleartext to authenticate the user. The server should return a session token instead to avoid transmitting the password multiple times.

## Current Behavior

1. User signs up with email and password
2. Password is sent in the signup request
3. Password is sent AGAIN in a separate request to sign in the user
4. Password transmitted twice across the network

## Expected Behavior

- Server should return a session token after successful signup
- Client should use the session token to authenticate
- Password should only be sent once during the signup process
- No need to resend password in cleartext

## File References

- `apps/web/src/app/auth/signup/page.tsx:62`
- FIXME comment present: "return a session token from the server to negate the need to resend cleartext password"

## Security Impact

🔴 **Critical Security Issue**

- Increases exposure window for password interception
- Violates security best practices
- Multiple transmission points increase attack surface
- Could fail security audits and penetration tests
- Non-compliant with OWASP recommendations

## Proposed Solution

1. Modify signup API endpoint to return session token on success
2. Update client-side signup handler to use returned session token
3. Remove the second password transmission
4. Add integration test to verify single password transmission
5. Security review of complete auth flow

## Related

- Similar pattern may exist in other auth flows (check password reset when implemented)
- Review all credential transmission points in the application

## Acceptance Criteria

- [ ] Password only transmitted once during signup
- [ ] Session token returned from signup endpoint
- [ ] Client authenticated using session token
- [ ] No cleartext password in subsequent requests
- [ ] Integration tests verify single transmission
- [ ] Security review completed and signed off
