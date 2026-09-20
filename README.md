# JobTrack

[![Backend CI](https://github.com/KensukeOta/JobTrack/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/KensukeOta/JobTrack/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/KensukeOta/JobTrack/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/KensukeOta/JobTrack/actions/workflows/frontend-ci.yml)
[![E2E CI](https://github.com/KensukeOta/JobTrack/actions/workflows/e2e-ci.yml/badge.svg)](https://github.com/KensukeOta/JobTrack/actions/workflows/e2e-ci.yml)

求人への応募状況・選考進捗・次に行うアクションを一元管理するWebアプリケーションです。

複数企業へ応募すると、選考状況や次回の面接・連絡予定などの情報が分散しやすくなります。

JobTrackでは求人情報と選考状況をひとつの場所で管理し、
ダッシュボードから就職活動全体の進捗と今後の予定を確認できます。

## Demo

**https://job-track-kensuke.vercel.app**

ユーザー登録後、そのままログイン状態となり、
求人登録・応募状況管理・ダッシュボードなどの主要機能を利用できます。

## Screenshots

### Dashboard

![Dashboard](docs/images/dashboard.png)

### Job List

![Job List](docs/images/jobs.png)

### Job Detail

![Job Detail](docs/images/job-detail.png)

## Features

- ユーザー登録・ログイン・ログアウト
- 求人情報の登録・閲覧・編集・削除
- 求人の検索・ステータス絞り込み
- 並び替え・ページネーション
- 応募状況を確認できるダッシュボード
- ステータス別の求人件数表示
- 今後のアクション・予定の表示
- ユーザーごとの求人データ分離
- PC・モバイル対応
- キーボード操作を考慮したUI

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- FastAPI
- Python 3.13
- SQLModel
- Alembic
- PostgreSQL
- psycopg

### Testing

- pytest
- Vitest
- React Testing Library
- Playwright

### Infrastructure / CI

- Vercel
- Railway
- Docker
- Docker Compose
- GitHub Actions

## Technical Highlights

### 1. HttpOnly Cookieを利用した認証

JWTをJavaScriptから直接扱うのではなく、
アクセストークンを `HttpOnly Cookie` として保存しています。

パスワードはArgon2でハッシュ化し、
認証が必要なAPIではユーザー情報を検証します。

### 2. CSRF対策

Cookieベースの認証に対して、
signed double-submit方式によるCSRF対策を実装しています。

POST / PATCH / DELETEなどの更新系リクエストでは、
CookieとリクエストヘッダーのCSRF tokenを検証します。

### 3. ユーザー単位のデータ分離

求人データ取得時には求人IDだけでなく、
認証中のユーザーIDを条件として使用します。

他ユーザーの求人にアクセスした場合も、
その求人の存在を外部へ明らかにしないよう404として扱います。

### 4. Frontend / BackendのOrigin統一

本番環境ではNext.js Rewriteを利用し、

```text
/api/v1/*
```

へのリクエストをFastAPIへ転送します。

ブラウザから見たFrontendとAPIのOriginを統一することで、
HttpOnly Cookieを利用した認証・CSRF対策を扱いやすい構成にしています。

### 5. Backend / Frontend / E2Eの3段階テスト

Backend、Frontend、実際のユーザーフローをそれぞれ異なるレイヤーでテストしています。

- pytest: 107 tests
- Vitest: 124 tests
- Playwright: 24 E2E tests

E2EではFrontend・Backend・PostgreSQLを組み合わせ、
実際のアプリケーションに近い環境で主要操作を検証します。

### 6. CI/CDとDatabase Migration

GitHub ActionsでBackend・Frontend・E2Eをそれぞれ検証しています。

本番デプロイ時のAlembic migrationは
アプリケーション起動処理から分離し、
RailwayのPre-deploy Commandとして実行します。

## Architecture

```text
Browser
  │
  │ HTTPS
  ▼
Vercel
Next.js
  │
  │ /api/v1/*
  │ Next.js Rewrite
  ▼
Railway
FastAPI
  │
  ▼
Railway
PostgreSQL
```

FrontendからBackend APIへの通信は、
Next.js Rewriteを利用してブラウザから見たAPI OriginをFrontendと統一しています。

これにより、HttpOnly Cookieを使用した認証と
CSRF対策を本番環境でも利用できる構成にしています。

## Authentication / Security

認証にはJWTを使用し、
アクセストークンは `HttpOnly Cookie` として保存します。

更新系リクエスト（POST / PATCH / DELETE）には、
signed double-submit方式によるCSRF対策を実装しています。

本番環境では以下のCookie設定を使用しています。

```text
HttpOnly: access_tokenのみ有効
Secure: true
SameSite: Lax
Path: /
```

主なセキュリティ対策：

- JWTによる認証
- Argon2によるパスワードハッシュ
- HttpOnly Cookie
- Secure Cookie
- signed double-submit CSRF
- ユーザー単位のリソース所有権チェック
- CORSの許可Origin制限
- secretsの環境変数管理

## Testing

JobTrackではBackend・Frontend・E2Eの3段階でテストを実施しています。

### Backend

Ruffによる静的解析とpytestによるテストを実行します。

```bash
cd backend
uv run ruff check .
uv run pytest
```

pytestでは107件のテストを実装しています。

### Frontend

ESLint、TypeScriptの型チェック、
Vitestによるコンポーネント・UIテストを実行します。

```bash
cd frontend
npm run lint
npm run typecheck
npm test
```

Vitestでは124件のテストを実装しています。

### E2E

Playwrightを使用して、
Frontend・Backend・PostgreSQLを組み合わせた主要ユーザーフローを検証します。

```bash
cd frontend
npm run test:e2e:full
```

検証環境：

- Chromium
- Firefox
- Mobile Chrome（Pixel 5）

Playwrightでは24件のE2Eテストを実装しています。

主な検証対象：

- ユーザー登録
- ログイン・ログアウト
- 認証が必要なページへのアクセス制御
- 求人作成・閲覧・編集・削除
- ダッシュボード

## Continuous Integration

GitHub Actionsを使用して、
Pull Requestおよびmainブランチへの変更時に
自動で品質チェックとテストを実行します。

### Backend CI

```text
Ruff
↓
Alembic migration
↓
pytest
```

### Frontend CI

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

E2Eテスト終了後は、
専用のDocker環境を自動的にクリーンアップします。

## Development

### Requirements

- Node.js 22
- Python 3.13
- uv
- Docker
- Docker Compose

### Environment Variables

`.env.example` をコピーして開発用環境変数を設定します。

```bash
cp .env.example .env
```

secretを含む `.env` はGit管理しません。

### Backend + PostgreSQL

```bash
docker compose up --build
```

Backend:

```text
http://localhost:8000
```

Frontendをローカルで起動する場合：

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

## Database Migration

Alembicを使用してデータベーススキーマを管理しています。

ローカルでmigrationを適用する場合：

```bash
cd backend
uv run alembic upgrade head
```

本番環境ではRailwayのPre-deploy Commandとしてmigrationを実行し、
Webアプリケーションの起動処理とは分離しています。

```bash
uv run alembic upgrade head
```

## Production / Deployment

### Frontend

Next.jsをVercelへデプロイしています。

`main` ブランチへの変更をVercelが検知し、
Production環境へデプロイします。

### Backend

FastAPIをRailwayへデプロイしています。

RailwayがGitHub Repositoryの `backend` ディレクトリから
Docker imageをbuildします。

デプロイ時には以下の順で処理します。

```text
Docker Build
↓
Alembic Migration
↓
FastAPI Start
↓
/health Health Check
↓
Production
```

Health Check:

```text
https://jobtrack-production-e2f1.up.railway.app/health
```

### Database

Railway PostgreSQLを使用しています。

BackendからPostgreSQLへの接続情報は
RailwayのReference Variablesで管理し、
認証情報をソースコードへ保存しない構成にしています。

## Future Improvements

現在のバージョンでは求人応募管理の基本機能を中心に実装しています。

今後の改善案として、以下を検討できます。

- 選考履歴の管理
- 面接・締切などの通知
- カレンダー連携
- 求人データの分析・可視化
- E2Eテスト対象シナリオの拡充

## License

This project is created as a portfolio project.
