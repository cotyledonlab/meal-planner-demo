#!/bin/bash
#
# Exploratory Testing Environment Initialization
# ===============================================
# Sets up the development environment for exploratory testing
#

set -e

PROJECT_DIR="/Users/johnmaher/development/meal-planner-demo"
cd "$PROJECT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Load environment variables from apps/web/.env
load_env() {
    echo -e "${YELLOW}Loading environment variables...${NC}"
    if [ -f "$PROJECT_DIR/apps/web/.env" ]; then
        # Export DATABASE_URL and other vars needed for Prisma
        set -a
        source "$PROJECT_DIR/apps/web/.env"
        set +a
        echo -e "${GREEN}Loaded environment from apps/web/.env${NC}"
    else
        echo -e "${RED}ERROR: apps/web/.env not found. Copy from .env.example${NC}"
        exit 1
    fi
}

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Exploratory Testing Environment Setup                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Docker is running
check_docker() {
    echo -e "${YELLOW}Checking Docker...${NC}"
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}ERROR: Docker is not running. Please start Docker.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Docker is running${NC}"
}

# Start database with Docker Compose
start_database() {
    echo -e "${YELLOW}Starting PostgreSQL database...${NC}"
    docker compose up -d postgres

    # Wait for postgres to be ready
    echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
    sleep 5

    until docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
        echo -e "${YELLOW}Waiting for PostgreSQL...${NC}"
        sleep 2
    done

    echo -e "${GREEN}PostgreSQL is ready${NC}"
}

# Reset and sync database schema
run_migrations() {
    echo -e "${YELLOW}Syncing database schema...${NC}"
    # Use db:push for dev - it syncs schema without migration history requirements
    # Add --accept-data-loss to allow resetting in dev environment
    cd "$PROJECT_DIR/apps/web"
    npx prisma db push --accept-data-loss
    cd "$PROJECT_DIR"
    echo -e "${GREEN}Database schema synced${NC}"
}

# Seed database
seed_database() {
    echo -e "${YELLOW}Seeding database with test data...${NC}"
    pnpm db:seed
    echo -e "${GREEN}Database seeded${NC}"
}

# Start dev server in background
start_dev_server() {
    echo -e "${YELLOW}Starting development server...${NC}"

    # Kill any existing dev server
    pkill -f "next dev" 2>/dev/null || true

    # Start in background and redirect output
    pnpm dev > /tmp/meal-planner-dev.log 2>&1 &
    DEV_PID=$!

    echo -e "${YELLOW}Waiting for dev server to start (PID: $DEV_PID)...${NC}"

    # Wait for server to be ready
    local max_attempts=30
    local attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo -e "${GREEN}Development server is ready at http://localhost:3000${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 2
    done

    echo -e "${RED}ERROR: Dev server failed to start. Check /tmp/meal-planner-dev.log${NC}"
    exit 1
}

# Print status
print_status() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}Environment is ready for exploratory testing!${NC}"
    echo ""
    echo -e "Application:     ${BLUE}http://localhost:3000${NC}"
    echo -e "Dev server log:  ${BLUE}/tmp/meal-planner-dev.log${NC}"
    echo ""
    echo -e "Test users:"
    echo -e "  Free user:     ${YELLOW}free@example.com / P@ssw0rd!${NC}"
    echo -e "  Premium user:  ${YELLOW}premium@example.com / P@ssw0rd!${NC}"
    echo -e "  Admin user:    ${YELLOW}admin@example.com / P@ssw0rd!${NC}"
    echo ""
    echo -e "To start testing, run:"
    echo -e "  ${BLUE}./run-exploratory-tests.sh${NC}"
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Main
main() {
    load_env
    check_docker
    start_database
    run_migrations
    seed_database
    start_dev_server
    print_status
}

main
