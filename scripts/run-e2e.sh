#!/bin/sh

set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"

COMPOSE_FILE="$ROOT_DIR/docker-compose.e2e.yml"
BACKEND_HEALTH_URL="http://localhost:8001/health"

cleanup() {
  echo ""
  echo "==> E2E環境を終了しています..."

  docker compose \
    -f "$COMPOSE_FILE" \
    down \
    --volumes

  echo "==> E2E環境を終了しました。"
}

trap cleanup EXIT INT TERM

echo "==> E2E用PostgreSQL / FastAPIを起動しています..."

docker compose \
  -f "$COMPOSE_FILE" \
  up \
  -d \
  --build

echo "==> FastAPIの起動を待っています..."

attempt=1
max_attempts=60

while [ "$attempt" -le "$max_attempts" ]; do
  if curl -fsS "$BACKEND_HEALTH_URL" >/dev/null 2>&1; then
    echo "==> FastAPIが起動しました。"
    break
  fi

  if [ "$attempt" -eq "$max_attempts" ]; then
    echo "ERROR: FastAPIが時間内に起動しませんでした。"
    echo ""
    echo "==> Backend logs"

    docker compose \
      -f "$COMPOSE_FILE" \
      logs \
      backend-e2e

    exit 1
  fi

  sleep 1
  attempt=$((attempt + 1))
done

echo ""
echo "==> Playwright E2Eテストを実行します..."

cd "$ROOT_DIR/frontend"

npm run test:e2e

echo ""
echo "==> E2EテストがすべてPASSしました。"