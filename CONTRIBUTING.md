# Contributing to Meal Planner Demo

Thank you for your interest in contributing to the Meal Planner Demo project! This document provides guidelines and information to help you contribute effectively.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Quality Standards](#code-quality-standards)
- [Pre-Merge CI Checks](#pre-merge-ci-checks)
- [Resolving Common CI Failures](#resolving-common-ci-failures)
- [Pull Request Process](#pull-request-process)

## Getting Started

1. **Fork the repository** and clone your fork locally
2. **Install dependencies**:

   ```bash
   pnpm install
   ```

   This command installs all dependencies and automatically sets up git hooks (via the `prepare` script) that will:
   - Automatically format and lint your code before each commit
   - Run type checking and tests to catch issues early
   - Help maintain consistent code quality across the project

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in the required values
4. **Start the database**:
   ```bash
   ./start-database.sh
   ```
5. **Initialize the database**:
   ```bash
   pnpm db:push
   ```
6. **Start development server**:
   ```bash
   pnpm dev
   ```

## Development Workflow

1. Create a new branch for your feature or bugfix:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our [code quality standards](#code-quality-standards)

3. Run checks locally before committing:

   ```bash
   pnpm check        # Runs lint + typecheck
   pnpm format:write # Auto-format your code
   ```

   **Note**: The pre-commit hook will automatically run formatting, linting, type checking, and tests when you commit. If the hook isn't working, you can run these commands manually or use the convenience script:

   ```bash
   pnpm precommit    # Run all pre-commit checks manually
   ```

4. Commit your changes with clear, descriptive messages

   The pre-commit hook will automatically verify your code. If you need to bypass the hook (not recommended), use:

   ```bash
   git commit --no-verify  # Or set SKIP_HOOKS=1
   ```

   **Warning**: Only bypass hooks if you're certain the code is correct and plan to fix issues in a follow-up commit.

5. Push to your fork and create a pull request

   Before pushing, the pre-push hook will run format checking, linting, and type checking to catch issues before they reach CI.

## Code Quality Standards

We maintain high code quality standards through automated checks and manual review:

- **TypeScript**: Use strict typing, avoid `any` types
- **Code Style**: Follow ESLint rules and Prettier formatting
- **File Organization**: Keep components modular and well-organized
- **Documentation**: Add comments for complex logic, update docs when needed
- **Environment Variables**: Never commit secrets or API keys

## Pre-Merge CI Checks

All pull requests must pass the following automated checks before merging:

### 1. Linting (ESLint)

Checks code style and catches potential errors.

**Command**: `pnpm lint`

**What it checks**:

- ESLint rules compliance
- TypeScript-specific linting rules
- Next.js best practices

### 2. Type Checking (TypeScript)

Ensures type safety across the codebase.

**Command**: `pnpm typecheck`

**What it checks**:

- TypeScript compilation without errors
- Type correctness and inference
- No implicit `any` types

### 3. Formatting (Prettier)

Validates consistent code formatting.

**Command**: `pnpm format:check`

**What it checks**:

- Code formatting consistency
- Single quotes, trailing commas, semicolons
- Line length and indentation

### 4. Build

Verifies the application builds successfully.

**Command**: `pnpm build`

**What it checks**:

- Next.js builds without errors
- All imports resolve correctly
- No runtime errors during build

### 5. Security Scan

Scans for dependency vulnerabilities.

**Command**: `pnpm audit --audit-level=moderate`

**What it checks**:

- Known security vulnerabilities in dependencies
- Moderate and higher severity issues

## Resolving Common CI Failures

### Linting Errors

**Problem**: ESLint reports errors or warnings

**Solutions**:

```bash
# View linting errors
pnpm lint

# Auto-fix many linting issues
pnpm lint:fix

# For issues that can't be auto-fixed, manually update the code
```

Common issues:

- Missing imports or unused variables
- Incorrect TypeScript types
- Code style violations

### Type Checking Errors

**Problem**: TypeScript compilation fails

**Solutions**:

```bash
# Run type checker to see errors
pnpm typecheck

# Common fixes:
# - Add missing type annotations
# - Fix type mismatches
# - Import missing types
# - Add null/undefined checks
```

### Formatting Errors

**Problem**: Code doesn't match Prettier formatting

**Solutions**:

```bash
# Check which files have formatting issues
pnpm format:check

# Auto-fix all formatting issues
pnpm format:write
```

**Important**: Always run `pnpm format:write` before committing!

### Build Errors

**Problem**: Next.js build fails

**Solutions**:

```bash
# Run build locally to see errors
pnpm build

# Common issues:
# - Missing environment variables (check .env.example)
# - Import errors or circular dependencies
# - Runtime errors in server components
```

**Note**: CI uses placeholder environment variables. If your code requires specific env vars, update the CI workflow.

### Security Vulnerabilities

**Problem**: Dependency audit finds vulnerabilities

**Solutions**:

```bash
# View all vulnerabilities
pnpm audit

# Update vulnerable dependencies
pnpm update [package-name]

# For critical issues that can't be immediately fixed:
# - Document the issue in your PR
# - Create a follow-up issue
# - Discuss with maintainers
```

## Pull Request Process

1. **Before Submitting**:
   - Run all checks locally: `pnpm check && pnpm format:check && pnpm build`
   - Ensure all CI checks pass
   - Update documentation if needed
   - Add meaningful commit messages

2. **PR Description**:
   - Clearly describe what changes you made and why
   - Reference any related issues
   - Include screenshots for UI changes
   - Note any breaking changes

3. **Review Process**:
   - Address reviewer feedback promptly
   - Re-run checks after making changes
   - Keep the PR focused and reasonably sized

4. **After Approval**:
   - Maintainers will merge your PR
   - Your changes will be deployed in the next release

## Questions or Issues?

If you encounter problems or have questions:

- Check existing issues on GitHub
- Review the main [README.md](./README.md) and [AGENTS.md](./AGENTS.md)
- Open a new issue for bugs or feature requests
- Reach out to maintainers for guidance

Thank you for contributing! 🎉
