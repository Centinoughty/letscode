#!/usr/bin/env bash
set -e

SERVICES=(
    auth
)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "$ROOT_DIR"

for SERVICE in "${SERVICES[@]}"; do
    docker compose \
    --env-file .env \
    -f infra/docker-compose.dev.yml \
    exec $SERVICE \
    npx prisma migrate dev --name init
done
