#!/bin/bash
#
# Ralph Wiggum Bug Fix Loop
# =========================
# Runs Claude Code in a loop to fix bugs one at a time.
# Each iteration picks up where the last one left off via fix-progress.txt
#
# Usage: ./run-bug-fixes.sh [max_iterations]
#

set -e

# Configuration
PROJECT_DIR="/Users/johnmaher/development/meal-planner-demo"
BUGS_FILE="$PROJECT_DIR/bug-fixes.json"
PROGRESS_FILE="$PROJECT_DIR/fix-progress.txt"
PROMPT_FILE="$PROJECT_DIR/BUG_FIX_PROMPT.md"
MAX_ITERATIONS=${1:-14}  # Default to total bug count

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Ralph Wiggum Bug Fix Loop                                  ║${NC}"
echo -e "${BLUE}║     meal-planner-demo Production Readiness                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"

    if [ ! -f "$BUGS_FILE" ]; then
        echo -e "${RED}ERROR: Bugs file not found: $BUGS_FILE${NC}"
        exit 1
    fi

    if [ ! -f "$PROMPT_FILE" ]; then
        echo -e "${RED}ERROR: Prompt file not found: $PROMPT_FILE${NC}"
        exit 1
    fi

    if ! command -v claude &> /dev/null; then
        echo -e "${RED}ERROR: 'claude' command not found. Install Claude Code CLI.${NC}"
        exit 1
    fi

    echo -e "${GREEN}Prerequisites check passed${NC}"
}

# Count remaining bugs
count_remaining_bugs() {
    grep -c '"fixed": false' "$BUGS_FILE" 2>/dev/null || echo "0"
}

# Get current stats
get_stats() {
    local total=$(grep -c '"id":' "$BUGS_FILE" 2>/dev/null || echo "0")
    local fixed=$(grep -c '"fixed": true' "$BUGS_FILE" 2>/dev/null || echo "0")
    local remaining=$(count_remaining_bugs)
    echo "$total $fixed $remaining"
}

# Run single iteration
run_iteration() {
    local iteration=$1
    local remaining=$(count_remaining_bugs)

    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  Iteration $iteration of $MAX_ITERATIONS                          ${NC}"
    echo -e "${BLUE}  Bugs remaining: $remaining                                       ${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    if [ "$remaining" -eq 0 ]; then
        echo -e "${GREEN}All bugs have been fixed!${NC}"
        return 1
    fi

    echo -e "${YELLOW}Starting Claude Code iteration...${NC}"

    cd "$PROJECT_DIR"

    local prompt_content
    prompt_content=$(cat "$PROMPT_FILE")

    # Run Claude Code in print mode (non-interactive)
    claude -p --dangerously-skip-permissions "$prompt_content"

    local exit_code=$?

    if [ $exit_code -ne 0 ]; then
        echo -e "${YELLOW}Claude Code exited with code: $exit_code${NC}"
    fi

    return 0
}

# Print final summary
print_summary() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                    BUG FIXING COMPLETE                         ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    read -ra stats <<< "$(get_stats)"
    local total=${stats[0]}
    local fixed=${stats[1]}
    local remaining=${stats[2]}

    echo -e "Total bugs:      ${BLUE}$total${NC}"
    echo -e "Fixed:           ${GREEN}$fixed${NC}"
    echo -e "Remaining:       ${RED}$remaining${NC}"
    echo ""
    echo -e "Progress file:   ${BLUE}$PROGRESS_FILE${NC}"
    echo -e "Bug list:        ${BLUE}$BUGS_FILE${NC}"
    echo ""
}

# Main execution
main() {
    echo -e "${YELLOW}Max iterations: $MAX_ITERATIONS${NC}"
    echo ""

    check_prerequisites

    local iteration=1

    while [ $iteration -le $MAX_ITERATIONS ]; do
        if ! run_iteration $iteration; then
            break
        fi

        iteration=$((iteration + 1))

        # Small delay between iterations
        sleep 2
    done

    print_summary
}

# Handle Ctrl+C gracefully
trap 'echo -e "\n${YELLOW}Interrupted. Progress saved to $PROGRESS_FILE${NC}"; print_summary; exit 0' INT

main
