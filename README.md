# JobTrack

[![Backend CI](https://github.com/KensukeOta/JobTrack/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/KensukeOta/JobTrack/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/KensukeOta/JobTrack/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/KensukeOta/JobTrack/actions/workflows/frontend-ci.yml)
[![E2E CI](https://github.com/KensukeOta/JobTrack/actions/workflows/e2e-ci.yml/badge.svg)](https://github.com/KensukeOta/JobTrack/actions/workflows/e2e-ci.yml)

求人応募状況を一元管理するWebアプリケーション。

## Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS

### Backend

- FastAPI
- Python
- SQLModel
- Alembic
- PostgreSQL

### Testing

- pytest
- Vitest
- React Testing Library
- Playwright

### CI

- GitHub Actions

## Status

🚧 In development

## Development

### Requirements

- Node.js 22
- Python 3.13
- uv
- Docker
- Docker Compose

### Backend + PostgreSQL

```bash
cp .env.example .env
docker compose up --build
```

## Testing

JobTrackでは、Backend・Frontend・E2Eの3段階でテストを実施しています。

### Backend

Ruffによる静的解析とpytestによるテストを実行します。

```bash
cd backend
uv run ruff check .
uv run pytest
```

現在、pytestは105件のテストを実装しています。

### Frontend

ESLint、TypeScriptの型チェック、Vitestによるコンポーネント・UIテストを実行します。

```bash
cd frontend
npm run lint
npm run typecheck
npm test
```

現在、Vitestは115件のテストを実装しています。

### E2E

Playwrightを使用して、実際のFrontend・Backend・PostgreSQLを組み合わせた
主要ユーザーフローを検証します。

```bash
cd frontend
npm run test:e2e:full
```

E2Eテストでは以下の環境を使用します。

- Chromium
- Firefox
- Mobile Chrome（Pixel 5）

現在、Playwrightは21件のE2Eテストを実装しています。

## Continuous Integration

GitHub Actionsを使用して、Pull Requestおよびmainブランチへの変更時に
自動で品質チェックとテストを実行します。

### Backend CI

Backend関連の変更に対して以下を実行します。

```text
Ruff
↓
Alembic migration
↓
pytest
```

### Frontend CI

Frontend関連の変更に対して以下を実行します。

```text
ESLint
↓
Next.js type generation
↓
TypeScript type check
↓
Vitest
```

### E2E CI

Frontend・Backendを含む主要な変更に対して、
実際のアプリケーション構成でE2Eテストを実行します。

```text
PostgreSQL
↓
Alembic migration
↓
FastAPI
↓
Next.js
↓
Playwright
  ├─ Chromium
  ├─ Firefox
  └─ Mobile Chrome（Pixel 5）
```

テスト終了後、E2E用のDocker環境は自動的にクリーンアップされます。
