# Git Hooks

This directory contains Git hooks managed by [Husky](https://typicode.github.io/husky/).

## Pre-commit Hook

The pre-commit hook runs `lint-staged` on staged files:

1. **Prettier** formatting for supported file types
2. **ESLint** fixes for TypeScript files

If any check fails, the commit will be blocked. Fix the issues and try again.

## Pre-push Hook

The pre-push hook runs before pushing to remote to catch issues before they reach CI:

1. **Format checking**: Ensures all files follow Prettier formatting rules
2. **Linting**: Validates code style and catches potential errors with ESLint
3. **Type checking**: Ensures TypeScript compilation succeeds without errors
4. **Tests**: Runs the full test suite

This hook prevents formatting, linting, typing, and test failures from reaching CI, saving time and resources.

## Bypassing Hooks (Not Recommended)

In rare cases, you can bypass the hooks with:

```bash
git commit --no-verify  # Skip pre-commit hook
git push --no-verify    # Skip pre-push hook
SKIP_HOOKS=1 git commit # Alternative: set environment variable
SKIP_HOOKS=1 git push   # Alternative: set environment variable
```

**Warning**: Only use this if you're absolutely sure the code is correct and plan to fix issues in a follow-up commit.

## Installation

Hooks are automatically installed when you run:

```bash
pnpm install
```

This triggers the `prepare` script which runs `husky` to set up the hooks.
