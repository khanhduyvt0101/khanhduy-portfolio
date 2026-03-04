#!/bin/bash

# Clear all caches to ensure fresh dependency installation
echo "Clearing caches..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .next 2>/dev/null || true
rm -rf ~/.bun/install/cache 2>/dev/null || true

echo "Preparing..."
