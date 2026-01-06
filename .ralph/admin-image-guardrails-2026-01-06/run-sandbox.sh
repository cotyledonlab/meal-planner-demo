#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
RUN_DIR="${SANDBOX_DIR:-/tmp/codex-sandbox}"
IMAGE_NAME="codex-sandbox"
DOCKERFILE_PATH="$ROOT_DIR/Dockerfile.codex-sandbox"
CODEX_AUTH_FILE="$HOME/.codex/auth.json"

if [[ -z "${CODEX_API_KEY:-}" ]] && [[ ! -f "$CODEX_AUTH_FILE" ]]; then
  echo "Set CODEX_API_KEY or create $CODEX_AUTH_FILE before running." >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required but not found in PATH." >&2
  exit 1
fi

cat > "$DOCKERFILE_PATH" <<'DOCKERFILE'
FROM node:20-slim
RUN apt-get update && apt-get install -y \
  git curl ca-certificates openssh-client \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /work
DOCKERFILE

mkdir -p "$RUN_DIR"

docker build -f "$DOCKERFILE_PATH" -t "$IMAGE_NAME" "$ROOT_DIR"

docker compose -f "$ROOT_DIR/.ralph/admin-image-guardrails-2026-01-06/docker-compose.yml" up -d

cat <<'INFO'
Starting sandbox container. The container will clone the repo into /work and run the Ralph loop.
INFO

DOCKER_RUN_ARGS=(
  -it --rm
  -e CODEX_API_KEY
  -e REDIS_URL="redis://127.0.0.1:6379"
  -v "$RUN_DIR":/work
  --network host
)

if [[ -f "$CODEX_AUTH_FILE" ]]; then
  DOCKER_RUN_ARGS+=(
    -v "$HOME/.codex:/root/.codex:ro"
  )
fi

DOCKER_RUN_ARGS+=(
  "$IMAGE_NAME"
  bash -lc
)

docker run "${DOCKER_RUN_ARGS[@]}" "\
    if [ ! -d /work/meal-planner-demo ]; then \
      git clone https://github.com/cotyledonlab/meal-planner-demo.git /work/meal-planner-demo; \
    else \
      git -C /work/meal-planner-demo fetch --all --prune; \
      git -C /work/meal-planner-demo pull --ff-only; \
    fi; \
    if ! command -v codex >/dev/null 2>&1; then \
      npm install -g @openai/codex; \
    fi; \
    cd /work/meal-planner-demo; \
    ./.ralph/admin-image-guardrails-2026-01-06/run-loop.sh 10 \
  "

cat <<'INFO'
Done. Redis is still running. Stop it with:
  docker compose -f .ralph/admin-image-guardrails-2026-01-06/docker-compose.yml down
INFO
