#!/bin/bash
set -e
PROJECT_DIR="${PROJECT_DIR:-$(pwd)}"
MAX_ITERATIONS=${1:-10}

cd "$PROJECT_DIR/.ralph/admin-image-guardrails-2026-01-06"

for ((i=1; i<=MAX_ITERATIONS; i++)); do
  remaining=$(grep -c '"completed": false' features.json || echo "0")
  [ "$remaining" -eq 0 ] && echo "All done!" && break

  echo "Iteration $i of $MAX_ITERATIONS ($remaining remaining)"
  codex -p --profile default --dangerously-bypass-approvals-and-sandbox "$(cat PROMPT.md)"
  sleep 2
done
