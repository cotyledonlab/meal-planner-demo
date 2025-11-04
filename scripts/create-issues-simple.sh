#!/bin/bash

# Simplified script to create GitHub issues
# This version uses simpler parsing that doesn't require jq

set -e

REPO="cotyledonlab/meal-planner-demo"
ISSUES_DIR=".github/issues-to-create"

if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_TOKEN environment variable is not set"
    echo ""
    echo "To create issues:"
    echo "1. Generate a GitHub Personal Access Token at:"
    echo "   https://github.com/settings/tokens/new"
    echo "   - Select scope: 'repo' (Full control of private repositories)"
    echo ""
    echo "2. Run this script:"
    echo "   GITHUB_TOKEN=your_token_here ./scripts/create-issues-simple.sh"
    echo ""
    echo "Or create issues manually from the markdown files in:"
    echo "   .github/issues-to-create/"
    exit 1
fi

echo "Creating GitHub issues for exploratory testing findings..."
echo "Repository: $REPO"
echo ""

# Issue 1: Password security
echo "Creating Issue 1: Password sent in cleartext after signup"
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO/issues" \
  -d @- <<'EOF'
{
  "title": "[SECURITY] Password sent in cleartext after signup",
  "body": "## Description\n\nAfter user signup, the password is sent in cleartext to authenticate the user. The server should return a session token instead to avoid transmitting the password multiple times.\n\n## Current Behavior\n\n1. User signs up with email and password\n2. Password is sent in the signup request\n3. Password is sent AGAIN in a separate request to sign in the user\n4. Password transmitted twice across the network\n\n## Expected Behavior\n\n- Server should return a session token after successful signup\n- Client should use the session token to authenticate\n- Password should only be sent once during the signup process\n- No need to resend password in cleartext\n\n## File References\n\n- `apps/web/src/app/auth/signup/page.tsx:62`\n- FIXME comment present: \"return a session token from the server to negate the need to resend cleartext password\"\n\n## Security Impact\n\n🔴 **Critical Security Issue**\n\n- Increases exposure window for password interception\n- Violates security best practices\n- Multiple transmission points increase attack surface\n- Could fail security audits and penetration tests\n- Non-compliant with OWASP recommendations\n\n## Acceptance Criteria\n\n- [ ] Password only transmitted once during signup\n- [ ] Session token returned from signup endpoint\n- [ ] Client authenticated using session token\n- [ ] No cleartext password in subsequent requests\n- [ ] Integration tests verify single transmission\n- [ ] Security review completed and signed off\n\nSee detailed issue description: `.github/issues-to-create/001-password-cleartext-security.md`",
  "labels": ["security", "critical", "bug"]
}
EOF

sleep 2

# Issue 2: Recipe swapping
echo ""
echo "Creating Issue 2: Recipe swapping feature not implemented"
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO/issues" \
  -d @- <<'EOF'
{
  "title": "Recipe swapping feature not implemented",
  "body": "## Description\n\nThe recipe swap button exists in the meal plan view but only shows an alert saying \"Recipe swapping feature coming soon!\" This is mentioned as a core feature in the project specifications.\n\n## Current Behavior\n\n1. User views their meal plan\n2. User clicks on a recipe card to open details\n3. User clicks \"Swap Recipe\" button\n4. Alert appears: \"Recipe swapping feature coming soon!\"\n5. Modal closes without any action\n\n## Expected Behavior\n\n- User can swap any recipe for an alternative\n- Alternative recipes respect dietary preferences and constraints\n- Shopping list updates automatically\n- Changes persist to database\n\n## File References\n\n- `apps/web/src/app/_components/MealPlanView.tsx:119`\n- `specs/002-project-mealmind-ai/spec.md`\n\n## Specification Reference\n\n> \"Swap meal\" button regenerates a single meal respecting constraints.\n\n## Acceptance Criteria\n\n- [ ] User can swap any recipe in their meal plan\n- [ ] Alternative recipes respect all dietary preferences\n- [ ] Shopping list updates automatically after swap\n- [ ] Changes persist to database\n- [ ] Loading state shown during swap operation\n- [ ] Error handling for failures\n- [ ] Works on mobile and desktop\n\nSee detailed issue description: `.github/issues-to-create/002-recipe-swapping-not-implemented.md`",
  "labels": ["enhancement", "high-priority", "feature"]
}
EOF

sleep 2

# Issue 3: Export functionality
echo ""
echo "Creating Issue 3: Export functionality missing (PDF/CSV)"
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO/issues" \
  -d @- <<'EOF'
{
  "title": "Export functionality missing (PDF/CSV)",
  "body": "## Description\n\nProject specifications mention PDF and CSV export for meal plans and shopping lists, but this functionality is not implemented.\n\n## Current Behavior\n\n- No export buttons visible in the UI\n- No way to download meal plans\n- No CSV export for shopping lists\n- Users must manually copy/paste or screenshot\n\n## Expected Behavior\n\n### PDF Export\n- Export meal plan as formatted PDF\n- Include recipes, ingredients, instructions\n- Print-optimized layout\n\n### CSV Export\n- Export shopping list as CSV\n- Compatible with Excel, Google Sheets\n- Includes quantity, unit, category\n\n## Specification Reference\n\nFrom `specs/002-project-mealmind-ai/spec.md`:\n> Export buttons: PDF (plan + recipes condensed) and CSV (shopping list).\n\n## Use Cases\n\n- Print meal plan for kitchen reference\n- Import shopping list to budgeting app\n- Share meal plan with family members\n- Archive meal plans offline\n\n## Acceptance Criteria\n\n- [ ] PDF export button on meal plan page\n- [ ] CSV export button on shopping list\n- [ ] PDF includes all meals and recipes\n- [ ] CSV has proper format with headers\n- [ ] Files download with meaningful names\n- [ ] Works on mobile and desktop\n- [ ] Loading states during generation\n- [ ] Error handling\n\nSee detailed issue description: `.github/issues-to-create/003-export-functionality-missing.md`",
  "labels": ["enhancement", "high-priority", "feature"]
}
EOF

sleep 2

# Issue 4: Password reset
echo ""
echo "Creating Issue 4: Password reset flow not implemented"
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO/issues" \
  -d @- <<'EOF'
{
  "title": "Password reset flow not implemented",
  "body": "## Description\n\nUsers have no way to reset their password if they forget it. This is a critical authentication feature for any production application.\n\n## Current Behavior\n\n1. User forgets password\n2. Goes to sign-in page\n3. No \"Forgot Password?\" link available\n4. User cannot access their account\n5. Only option: Create a new account (losing all data)\n\n## Expected Behavior\n\n1. User clicks \"Forgot Password?\" on sign-in page\n2. Enters email address\n3. Receives email with secure reset link\n4. Clicks link and enters new password\n5. Password updated successfully\n6. User can sign in with new password\n\n## Security Requirements\n\n- Reset tokens must be cryptographically secure\n- Tokens expire after 1 hour\n- Tokens are single-use only\n- Rate limiting (max 3 requests/hour/email)\n- No user enumeration\n- Password requirements enforced\n\n## File References\n\n- `docs/AUTH.md:314` - Lists as future feature\n- `apps/web/src/app/auth/signin/page.tsx` - Missing link\n\n## User Impact\n\n🔴 **Critical for Production**\n- Users will forget passwords\n- No recovery = permanent lockout\n- Standard feature in all modern apps\n\n## Acceptance Criteria\n\n- [ ] \"Forgot Password?\" link on sign-in page\n- [ ] Request reset page with email input\n- [ ] Email sent with reset link\n- [ ] Reset password page with validation\n- [ ] Tokens expire after 1 hour\n- [ ] Rate limiting prevents spam\n- [ ] Security testing completed\n\nSee detailed issue description: `.github/issues-to-create/004-password-reset-flow.md`",
  "labels": ["enhancement", "high-priority", "auth", "feature"]
}
EOF

echo ""
echo "Done! Issues created successfully."
echo "View issues at: https://github.com/$REPO/issues"
