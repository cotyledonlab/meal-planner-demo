# [SECURITY] Update dependencies to fix Dependabot vulnerabilities

**Labels:** security, dependencies, moderate
**Priority:** P1 - High
**Related:** Dependabot alerts

## Description

GitHub Dependabot has identified security vulnerabilities in project dependencies that need to be addressed. Two moderate severity vulnerabilities have been confirmed via `pnpm audit`.

## Vulnerabilities Identified

### 1. NextAuth.js Email Misdelivery (Moderate)

**Package:** `next-auth@5.0.0-beta.25`
**Severity:** Moderate
**CVE:** None assigned
**Advisory:** [GHSA-5jpx-9hw9-2fx4](https://github.com/advisories/GHSA-5jpx-9hw9-2fx4)

**Issue:**
NextAuth.js's email sign-in can be forced to deliver authentication emails to an attacker-controlled mailbox due to a bug in nodemailer's address parser.

**Attack Vector:**
Crafted email like `"e@attacker.com"@victim.com` is parsed incorrectly, sending verification emails to attacker instead of victim.

**Impact on This Application:** Medium
- Application uses password auth as primary method
- If password reset is implemented (Issue #4), this becomes critical
- Email verification could be compromised

**Fix:** Update to `next-auth@>=5.0.0-beta.30`

---

### 2. node-tar Race Condition (Moderate)

**Package:** `tar@7.5.1` (transitive dependency)
**Severity:** Moderate
**CVE:** CVE-2025-64118
**Advisory:** [GHSA-29xp-372q-xqph](https://github.com/advisories/GHSA-29xp-372q-xqph)

**Issue:**
Using `tar.list()` with `sync: true` can return uninitialized memory if tar file is truncated during read.

**Dependency Path:**
```
apps/web > @tailwindcss/postcss > @tailwindcss/oxide > tar@7.5.1
```

**Impact on This Application:** Low
- Only used in build tools, not runtime
- Requires specific attack conditions (file system access, race condition)
- Not directly used by application code

**Fix:** Update to `tar@>=7.5.2`

---

### 3. Possible Third Vulnerability

GitHub reported 3 vulnerabilities, but only 2 detected by `pnpm audit`. Possible explanations:
- Already resolved via pnpm overrides (Vite vulnerability)
- Development dependency not flagged by audit
- Platform-specific issue

**Investigation needed:** Check GitHub Security tab for details

---

## Remediation Steps

### 1. Update next-auth

```bash
cd apps/web
pnpm add next-auth@latest
```

Expected result: `next-auth@5.0.0-beta.30` or higher

### 2. Update tar dependency

**Option A: Update parent package (recommended)**
```bash
cd apps/web
pnpm update @tailwindcss/postcss@latest
```

**Option B: Use pnpm override**
Add to root `package.json`:
```json
{
  "pnpm": {
    "overrides": {
      "tar": ">=7.5.2"
    }
  }
}
```

### 3. Verify fixes

```bash
pnpm install
pnpm audit
```

Expected: 0 vulnerabilities

### 4. Test application

```bash
pnpm test
pnpm build
pnpm dev
```

---

## Testing Checklist

After updates, verify:

**Build & Tests**
- [ ] `pnpm install` completes without errors
- [ ] `pnpm audit` shows 0 vulnerabilities
- [ ] `pnpm build` succeeds
- [ ] All tests pass (`pnpm test`)
- [ ] No TypeScript compilation errors

**Authentication Flows**
- [ ] Sign in with credentials works
- [ ] Sign up flow works
- [ ] Session management works
- [ ] No console errors in browser

**Breaking Changes**
- [ ] Review NextAuth.js v5 beta.30 changelog
- [ ] Check for API changes
- [ ] Verify configuration still valid

---

## Related Security Issues

This issue is related to:
- #1 - Password sent in cleartext after signup (Critical)
- #4 - Password reset flow not implemented (High)
- #14 - Email verification not implemented (Low)

**Combined Security Concern:**
If password reset (Issue #4) is implemented before this vulnerability is fixed, the application will be vulnerable to account takeover via email misdelivery.

---

## Breaking Changes Risk

**NextAuth.js beta updates** may include breaking changes:
- Review: https://authjs.dev/getting-started/migrating-to-v5
- Check release notes: https://github.com/nextauthjs/next-auth/releases

**Likely safe** because:
- Application uses beta.25, updating to beta.30 (minor jump)
- Both are v5 beta versions
- Using CredentialsProvider (stable API)

**Potential issues:**
- Type changes
- Configuration format updates
- Session handling changes

---

## Timeline

**Effort Estimate:** 1-2 hours
- Package updates: 15 minutes
- Testing: 30-45 minutes
- Documentation: 15 minutes
- PR review: 30 minutes

**Priority:** High (before production deployment)

---

## Acceptance Criteria

- [ ] `pnpm audit` shows 0 moderate or higher vulnerabilities
- [ ] All tests passing
- [ ] Build succeeds
- [ ] Authentication flows tested and working
- [ ] Breaking changes documented (if any)
- [ ] Dependency lockfile updated and committed
- [ ] No regression in existing functionality

---

## Additional Security Recommendations

1. **Enable Dependabot Auto-Updates**
   - Configure `.github/dependabot.yml`
   - Auto-merge security patches

2. **Add Security Audit to CI**
   ```yaml
   - name: Security Audit
     run: pnpm audit --audit-level moderate
   ```

3. **Regular Security Reviews**
   - Weekly: `pnpm audit`
   - Monthly: Update all dependencies
   - Quarterly: Security penetration testing

4. **Subscribe to Security Advisories**
   - NextAuth.js security alerts
   - Node.js security announcements
   - GitHub Advisory Database

---

## Documentation

See `SECURITY_ANALYSIS.md` for detailed analysis including:
- Vulnerability descriptions
- Attack vectors
- Impact assessment
- Remediation procedures
- Testing guidelines

---

## Resources

- [NextAuth.js Security Advisory](https://github.com/advisories/GHSA-5jpx-9hw9-2fx4)
- [node-tar Security Advisory](https://github.com/advisories/GHSA-29xp-372q-xqph)
- [OWASP Dependency Security](https://owasp.org/www-project-dependency-check/)
- [npm Security Best Practices](https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities)
