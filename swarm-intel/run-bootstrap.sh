#!/usr/bin/env bash
# Optional helper to run the bootstrap script in a CI-friendly way
# Assumes env vars are set in the environment
set -euo pipefail

echo "Running GhostOS bootstrap..."
node ghostos-shopify-bootstrap.mjs
