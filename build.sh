#!/bin/bash
set -e

echo "🔨 Building Kidz Story Magic..."

# Navigate to frontend
cd frontend

# Install dependencies with legacy peer deps
npm ci --legacy-peer-deps

# Build the app
npm run build

# Copy the .next directory to root for Vercel to find it
cp -r .next ../../.next 2>/dev/null || true

cd ../..

echo "✅ Build complete"
