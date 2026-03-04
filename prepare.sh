#!/bin/bash

# Clear Vercel cache to ensure fresh dependency installation
echo "Clearing Vercel cache..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .next 2>/dev/null || true

echo "Preparing..."
