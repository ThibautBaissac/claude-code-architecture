#!/bin/bash

###############################################################################
# Post Tool Use Tracker Hook
#
# This hook runs after Edit, Write, or MultiEdit tools complete successfully.
# It tracks modified files and determines which checks/tests should be run.
#
# Hook Type: PostToolUse
###############################################################################

set -e

# Configuration
CACHE_DIR=".claude/cache/session"
SESSION_ID="${CLAUDE_SESSION_ID:-default}"
MODIFIED_FILES_LOG="$CACHE_DIR/$SESSION_ID-modified-files.log"
CHECKS_LOG="$CACHE_DIR/$SESSION_ID-checks-needed.log"

# Ensure cache directory exists
mkdir -p "$CACHE_DIR"

# Get the file path from the tool result
FILE_PATH="${TOOL_FILE_PATH:-}"
TOOL_NAME="${TOOL_NAME:-}"

# Only process Edit, Write, or MultiEdit tools
if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" && "$TOOL_NAME" != "MultiEdit" ]]; then
  exit 0
fi

# Skip if no file path provided
if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Skip markdown and documentation files
if [[ "$FILE_PATH" =~ \.(md|txt|json)$ ]]; then
  exit 0
fi

# Log the modified file with timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
echo "[$TIMESTAMP] $FILE_PATH" >> "$MODIFIED_FILES_LOG"

###############################################################################
# Determine what checks are needed based on file type
###############################################################################

detect_checks_needed() {
  local file="$1"
  local checks=()

  # Ruby files (models, controllers, services, etc.)
  if [[ "$file" =~ \.rb$ ]]; then
    # Skip spec files themselves
    if [[ ! "$file" =~ _spec\.rb$ ]]; then
      checks+=("rubocop")
      checks+=("rspec")

      # If it's a model, suggest running model specs
      if [[ "$file" =~ app/models/ ]]; then
        checks+=("rspec:models")
      fi

      # If it's a controller, suggest running request specs
      if [[ "$file" =~ app/controllers/ ]]; then
        checks+=("rspec:requests")
      fi

      # If it's a migration, suggest db:migrate
      if [[ "$file" =~ db/migrate/ ]]; then
        checks+=("db:migrate")
      fi
    fi
  fi

  # JavaScript/Stimulus files
  if [[ "$file" =~ \.(js|jsx|ts|tsx)$ ]]; then
    checks+=("javascript:check")
  fi

  # CSS/Tailwind files
  if [[ "$file" =~ \.(css|scss)$ ]]; then
    checks+=("tailwind:build")
  fi

  # Config files
  if [[ "$file" =~ config/routes\.rb$ ]]; then
    checks+=("routes:check")
  fi

  # Gemfile
  if [[ "$file" =~ Gemfile$ ]]; then
    checks+=("bundle:check")
  fi

  # Output checks (deduplicated)
  for check in "${checks[@]}"; do
    echo "$check"
  done | sort -u
}

# Detect and log needed checks
checks=$(detect_checks_needed "$FILE_PATH")

if [[ -n "$checks" ]]; then
  echo "# Checks needed for: $FILE_PATH" >> "$CHECKS_LOG"
  echo "$checks" | while read -r check; do
    echo "  - $check" >> "$CHECKS_LOG"
  done
  echo "" >> "$CHECKS_LOG"
fi

###############################################################################
# Provide helpful context to Claude (optional output)
###############################################################################

# Count modified files in this session
FILE_COUNT=$(wc -l < "$MODIFIED_FILES_LOG" 2>/dev/null || echo "0")

# Only show reminder after multiple files have been modified
if [[ "$FILE_COUNT" -gt 3 ]]; then
  # Get unique checks needed
  UNIQUE_CHECKS=$(cat "$CHECKS_LOG" 2>/dev/null | grep "^  -" | sort -u | wc -l)

  if [[ "$UNIQUE_CHECKS" -gt 0 ]]; then
    echo ""
    echo "📝 Modified $FILE_COUNT files in this session."
    echo "Consider running checks: bin/rubocop, bundle exec rspec"
    echo ""
  fi
fi

exit 0
