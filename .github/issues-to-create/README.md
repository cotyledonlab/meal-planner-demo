# GitHub Issues to Create

This directory contains detailed issue descriptions ready to be created on GitHub.

## How to Use These Files

Each markdown file represents a complete GitHub issue with:
- **Title** - Clear, actionable issue title
- **Labels** - Suggested labels for categorization
- **Priority** - Severity/priority rating
- **Description** - Detailed problem description
- **Current/Expected Behavior** - Clear behavior comparison
- **File References** - Links to relevant code
- **Acceptance Criteria** - Testable completion requirements
- **Technical Details** - Implementation guidance

## Creating Issues

### Option 1: GitHub Web UI
1. Go to: https://github.com/cotyledonlab/meal-planner-demo/issues/new
2. Copy content from the markdown file
3. Paste into the issue description
4. Add suggested labels
5. Set priority/milestone if applicable
6. Submit

### Option 2: GitHub CLI (if available)
```bash
gh issue create \
  --title "Issue Title" \
  --body-file .github/issues-to-create/001-password-cleartext-security.md \
  --label "security,critical,bug"
```

### Option 3: Automated Script
```bash
# Create all issues at once
for file in .github/issues-to-create/*.md; do
  if [ "$file" != ".github/issues-to-create/README.md" ]; then
    title=$(grep -m 1 "^# " "$file" | sed 's/^# //')
    gh issue create --title "$title" --body-file "$file"
  fi
done
```

## Priority Guide

- **P0 - Critical**: Security issues, data loss, complete blockers
- **P1 - High**: Core features, major user pain points
- **P2 - Medium**: Important improvements, quality of life
- **P3 - Low**: Nice-to-haves, polish, minor enhancements

## Current Issues Ready for Creation

### Critical (P0)
1. **001-password-cleartext-security.md** - Password sent in cleartext after signup

### High Priority (P1)
2. **002-recipe-swapping-not-implemented.md** - Core feature not working
3. **003-export-functionality-missing.md** - PDF/CSV export from spec
4. **004-password-reset-flow.md** - Essential auth feature

### Medium Priority (P2+)
Additional issues documented in `ISSUES_TO_CREATE.md` and `EXPLORATORY_TESTING_FINDINGS.md`

## Labels to Create (if not existing)

```
security - Security-related issues
critical - Critical priority
high-priority - High priority
medium-priority - Medium priority
low-priority - Low priority
feature - New feature
enhancement - Improvement to existing feature
bug - Something isn't working
auth - Authentication/authorization
testing - Testing-related
ux - User experience
technical-debt - Code quality/refactoring
```

## After Creating Issues

1. Update `ISSUES_TO_CREATE.md` with issue numbers
2. Link issues in related code comments (e.g., `// TODO: Fix #123`)
3. Add to project board if using GitHub Projects
4. Assign to team members as appropriate
5. Set milestones for release planning

## Notes

- These issues are based on exploratory testing conducted on 2025-11-04
- See `EXPLORATORY_TESTING_FINDINGS.md` for complete test report
- Some issues may need refinement based on team discussion
- Priority levels are suggestions and can be adjusted

## Questions?

For questions about these issues or the exploratory testing process, refer to:
- `EXPLORATORY_TESTING_FINDINGS.md` - Full test report
- `ISSUES_TO_CREATE.md` - Complete list with brief descriptions
- Repository maintainers
