#!/bin/bash

# Only build if commit message contains [deploy] or [vercel]
if [[ "$VERCEL_GIT_COMMIT_MESSAGE" =~ \[deploy\]|\[vercel\] ]]; then
  echo "✅ Deploy flag found - Building..."
  exit 1
else
  echo "⏸️  No deploy flag - Skipping build"
  exit 0
fi
