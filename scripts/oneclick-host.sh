#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env.oneclick"

if [[ ! -f "${ENV_FILE}" ]]; then
  cp "${ROOT_DIR}/.env.oneclick.example" "${ENV_FILE}"
  ACCESS_SECRET="$(openssl rand -hex 32)"
  REFRESH_SECRET="$(openssl rand -hex 32)"
  sed -i.bak "s|replace_with_32_plus_chars_access_secret|${ACCESS_SECRET}|g" "${ENV_FILE}"
  sed -i.bak "s|replace_with_32_plus_chars_refresh_secret|${REFRESH_SECRET}|g" "${ENV_FILE}"
  sed -i.bak "s|replace_with_32_plus_chars_refresh_secret|${REFRESH_SECRET}|g" "${ENV_FILE}"
  # Ensure VITE_GOOGLE_CLIENT_ID is present in example before copying or append it
  if ! grep -q "VITE_GOOGLE_CLIENT_ID" "${ENV_FILE}"; then
    echo "VITE_GOOGLE_CLIENT_ID=" >> "${ENV_FILE}"
  fi
  rm -f "${ENV_FILE}.bak"
  echo "Created ${ENV_FILE}. Review paths, admin email, and Google Client ID before first run."
fi

echo "Building and starting OCaaS one-click stack..."
docker compose --env-file "${ENV_FILE}" -f "${ROOT_DIR}/docker-compose.oneclick.yml" up -d --build

echo "Waiting for backend to be ready..."
sleep 10

echo "Seeding core agents..."
docker exec ocaas-project-backend-1 node seed_agents.js || echo "Seeding failed or agents already exist."

echo "Done."
echo "Dashboard: http://localhost:8080"
echo "API health: http://localhost:3000/health"
