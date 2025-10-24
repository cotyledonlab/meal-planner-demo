# Git Hooks

This directory contains Git hooks managed by [Husky](https://typicode.github.io/husky/).

## Pre-commit Hook

The pre-commit hook automatically runs before each commit to ensure code quality:

1. **lint-staged**: Runs Prettier and ESLint on staged files
   - Formats TypeScript, JavaScript, JSON, Markdown, and YAML files
   - Fixes linting issues in TypeScript files

2. **TypeScript type checking**: Validates types across the entire codebase

3. **Tests**: Runs all test suites to ensure nothing is broken

If any check fails, the commit will be blocked. Fix the issues and try again.

## Pre-push Hook

The pre-push hook runs before pushing to remote to catch issues before they reach CI:

1. **Format checking**: Ensures all files follow Prettier formatting rules
2. **Linting**: Validates code style and catches potential errors with ESLint
3. **Type checking**: Ensures TypeScript compilation succeeds without errors

This hook prevents formatting and linting issues from reaching CI, saving time and resources.

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
