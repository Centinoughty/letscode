#!/bin/bash

set -e

IMAGES=(
  "python:3.11-alpine"
  "gcc:13"
  "node:22-alpine"
  "eclipse-temurin:17-jdk-alpine"
)

echo "Checking required Docker images..."

for image in "${IMAGES[@]}"; do
  if docker image inspect "$image" >/dev/null 2>&1; then
    echo "✓ $image already exists"
  else
    echo "↓ Pulling $image..."
    docker pull "$image"
    echo "✓ Pulled $image"
  fi
done

echo "All required images are available."
