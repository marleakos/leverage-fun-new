#!/bin/bash
set -e

echo "Building leveraged_meme program with Docker..."

# Clean up previous builds
rm -rf target Cargo.lock

# Build using Docker
docker-compose up --build

echo "Build complete! Check target/deploy/ for the .so file"
