#!/bin/bash

# Script to create GitHub issues from exploratory testing findings
# Requires: GITHUB_TOKEN environment variable with repo access
# Usage: GITHUB_TOKEN=your_token ./scripts/create-issues.sh

set -e

REPO="cotyledonlab/meal-planner-demo"
ISSUES_DIR=".github/issues-to-create"

# Check for GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_TOKEN environment variable is not set"
    echo "Usage: GITHUB_TOKEN=your_token ./scripts/create-issues.sh"
    exit 1
fi

# Function to extract title from markdown file
get_title() {
    local file=$1
    grep -m 1 "^# " "$file" | sed 's/^# //'
}

# Function to extract labels from markdown file
get_labels() {
    local file=$1
    grep "^**Labels:**" "$file" | sed 's/^**Labels:** //' | tr -d ' '
}

# Function to create issue via GitHub API
create_issue() {
    local file=$1
    local title=$(get_title "$file")
    local labels=$(get_labels "$file")
    local body=$(cat "$file")

    echo "Creating issue: $title"

    # Convert comma-separated labels to JSON array
    local labels_json=$(echo "$labels" | sed 's/,/","/g' | sed 's/^/["/' | sed 's/$/"]/')

    # Create JSON payload
    local json=$(jq -n \
        --arg title "$title" \
        --arg body "$body" \
        --argjson labels "$labels_json" \
        '{title: $title, body: $body, labels: $labels}')

    # Make API request
    response=$(curl -s -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$REPO/issues" \
        -d "$json")

    # Extract issue number
    issue_number=$(echo "$response" | jq -r '.number')

    if [ "$issue_number" != "null" ] && [ -n "$issue_number" ]; then
        echo "✓ Created issue #$issue_number: $title"
        echo "$issue_number" >> .github/created-issues.log
    else
        echo "✗ Failed to create issue: $title"
        echo "Response: $response"
    fi
}

# Main execution
echo "Creating GitHub issues for exploratory testing findings..."
echo "Repository: $REPO"
echo ""

# Create log file
mkdir -p .github
> .github/created-issues.log

# Create issues in priority order
for issue_file in \
    "$ISSUES_DIR/001-password-cleartext-security.md" \
    "$ISSUES_DIR/002-recipe-swapping-not-implemented.md" \
    "$ISSUES_DIR/003-export-functionality-missing.md" \
    "$ISSUES_DIR/004-password-reset-flow.md"
do
    if [ -f "$issue_file" ]; then
        create_issue "$issue_file"
        echo ""
        sleep 1  # Rate limiting courtesy
    else
        echo "Warning: File not found: $issue_file"
    fi
done

echo "Done! Created issues logged to .github/created-issues.log"
echo ""
echo "View issues at: https://github.com/$REPO/issues"
