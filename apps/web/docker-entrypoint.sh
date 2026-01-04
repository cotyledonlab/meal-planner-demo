#!/bin/sh
set -e

# If GOOGLE_CREDENTIALS_BASE64 is set, decode it and write to a file
if [ -n "$GOOGLE_CREDENTIALS_BASE64" ]; then
  echo "Setting up Google Cloud credentials..."
  echo "$GOOGLE_CREDENTIALS_BASE64" | base64 -d > /tmp/gcp-credentials.json
  export GOOGLE_APPLICATION_CREDENTIALS="/tmp/gcp-credentials.json"
  echo "Google Cloud credentials configured at $GOOGLE_APPLICATION_CREDENTIALS"
fi

# Execute the main command
exec "$@"
