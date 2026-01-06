#!/bin/bash
set -e

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
WORK_DIR="$SCRIPT_DIR"
MAX_ITERATIONS=${1:-10}

COPILOT_CMD=${COPILOT_CMD:-"copilot"}
COPILOT_MODEL=${COPILOT_MODEL:-"claude-sonnet-4.5"}
COPILOT_EXTRA_ARGS=${COPILOT_EXTRA_ARGS:-"--allow-all-tools"}

PROMPT_FILE="$WORK_DIR/PROMPT.md"
FEATURES_FILE="$WORK_DIR/features.json"
SERVER_LOG="$WORK_DIR/server.log"
SERVER_URL="http://localhost:3000"

start_server() {
  if lsof -i :3000 >/dev/null 2>&1; then
    return 0
  fi

  echo "Starting dev server (pnpm dev)..."
  (cd "$WORK_DIR/../.." && pnpm dev > "$SERVER_LOG" 2>&1 &)

  for _ in {1..30}; do
    if lsof -i :3000 >/dev/null 2>&1; then
      echo "Dev server is running."
      return 0
    fi
    sleep 2
  done

  echo "Dev server did not start within timeout. Check $SERVER_LOG"
  exit 1
}

if [ ! -f "$PROMPT_FILE" ] || [ ! -f "$FEATURES_FILE" ]; then
  echo "Missing PROMPT.md or features.json in $WORK_DIR"
  exit 1
fi

start_server

for ((i=1; i<=MAX_ITERATIONS; i++)); do
  remaining=$(grep -c '"completed": false' "$FEATURES_FILE" || echo "0")
  if [ "$remaining" -eq 0 ]; then
    echo "All done!"
    break
  fi

  echo "Iteration $i of $MAX_ITERATIONS ($remaining remaining)"
  read -r -a COPILOT_CMD_ARR <<< "$COPILOT_CMD"
  PROMPT_CONTENT=$(cat "$PROMPT_FILE")
  if command -v script >/dev/null 2>&1; then
    script -q /dev/null "${COPILOT_CMD_ARR[@]}" --model "$COPILOT_MODEL" -p "$PROMPT_CONTENT" $COPILOT_EXTRA_ARGS
  else
    "${COPILOT_CMD_ARR[@]}" --model "$COPILOT_MODEL" -p "$PROMPT_CONTENT" $COPILOT_EXTRA_ARGS
  fi
  sleep 2
done
