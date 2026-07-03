# RPG2d インフラ・デプロイガイド

本番デプロイの構成と、各サービスの要件・手順・環境変数をまとめています。

## アーキテクチャ

```
Browser
  ├─ editor (Cloudflare Pages) ──fetch+cookie──┐
  └─ runtime (Cloudflare Pages) ──fetch───────┼─► API (AWS Lambda Function URL)
                                               │
                                               ▼
                                          Neon (PostgreSQL)
                                               ▲
Auth0 ◄──────── OAuth redirect ────────────────┘
```

| コンポーネント | デプロイ先 | 管理方法 |
|---|---|---|
| API | AWS Lambda + Function URL | Terraform (`infra/aws`) + GitHub Actions |
| DB | Neon (Postgres 互換) | Neon ダッシュボード + GitHub Actions (migrate) |
| editor | Cloudflare Pages | GitHub Actions |
| runtime | Cloudflare Pages | GitHub Actions |
| 認証 | Auth0 | Auth0 ダッシュボード |
| CI/CD | GitHub Actions | `.github/workflows/deploy.yaml` |

**補足:** `runtime` の mock デモは `.github/workflows/pages.yaml` により GitHub Pages にもデプロイされます（本番 API 連携なし）。本番構成とは別系統です。

---

## セットアップ順序（初回）

1. [Neon](#1-neon-postgresql) — DB 作成
2. [AWS](#2-aws-lambda) — Terraform で Lambda 一式作成
3. [Auth0](#3-auth0) — アプリケーション設定
4. [Cloudflare Pages](#4-cloudflare-pages) — editor / runtime プロジェクト作成
5. [GitHub Actions](#5-github-actions) — Secrets / Variables 登録
6. `main` へ push または workflow 手動実行

---

## 1. Neon (PostgreSQL)

### 要件

- Postgres 互換（Neon Free / Launch いずれも可）
- **`pg_trgm` 拡張**（マイグレーション `001_extensions` が作成）
- 接続文字列に `?sslmode=require` を含める

### 手順

1. [Neon](https://neon.tech) でプロジェクトを作成
2. 接続文字列（Connection string）を控える
3. 初回マイグレーション（ローカルまたは CI 前に1回）:

```bash
DATABASE_URL='postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require' pnpm db:migrate
```

以降、`main` への push ごとに GitHub Actions の `migrate` ジョブが実行されます。

### 環境変数

| 変数 | 設定先 | 例 |
|---|---|---|
| `DATABASE_URL` | GitHub Secret / Lambda 環境変数 | `postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require` |
| `DATABASE_DRIVER` | Lambda 環境変数（CI が自動設定） | `neon` |

ローカル開発では `DATABASE_DRIVER` 省略（デフォルト `pg`）+ Docker Postgres を使用します（`.env.example` 参照）。

---

## 2. AWS (Lambda)

### 要件

- Terraform >= 1.5
- AWS CLI 資格情報（Terraform apply 用）
- Node.js 24 ランタイム（Lambda）
- リソース名接頭辞: **`RPG2d`**

### Terraform が作成するリソース

| リソース | 名前 |
|---|---|
| Lambda 関数 | `RPG2d-api` |
| Lambda 実行ロール | `RPG2d-api-lambda-exec` |
| CloudWatch Logs | `/aws/lambda/RPG2d-api` |
| Function URL | Lambda に付与（公開 HTTPS） |
| GitHub Actions 用 IAM ユーザー | `RPG2d-github-actions-deploy`（デフォルト有効） |

コード本体とアプリ環境変数（DB 接続・Auth0 等）は **GitHub Actions がデプロイ時に更新**します。Terraform はインフラの骨格のみ管理します。

### 手順

```bash
cd infra/aws
cp terraform.tfvars.example terraform.tfvars
# frontend_origins を実際の URL に編集

terraform init
terraform plan
terraform apply
```

主要な output:

```bash
terraform output api_lambda_function_url    # → VITE_API_BASE_URL
terraform output api_auth_callback_url      # → Auth0 Callback URL
terraform output api_lambda_function_name   # → GitHub Variable (RPG2d-api)
terraform output github_actions_deploy_user_name
```

GitHub Actions 用 IAM ユーザーのアクセスキー:

1. AWS コンソール → IAM → `RPG2d-github-actions-deploy`
2. アクセスキーを発行
3. GitHub Secrets に `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` として登録

### Terraform 変数 (`terraform.tfvars`)

| 変数 | 必須 | 説明 | 例 |
|---|---|---|---|
| `aws_region` | — | AWS リージョン | `ap-northeast-1` |
| `name_prefix` | — | リソース名接頭辞 | `RPG2d` |
| `frontend_origins` | **必須** | Function URL CORS 許可 origin | `["https://editor.example.com"]` |
| `lambda_memory_mb` | — | Lambda メモリ (MB) | `512` |
| `lambda_timeout_seconds` | — | Lambda タイムアウト (秒) | `30` |
| `log_retention_days` | — | ログ保持日数 | `14` |
| `create_github_actions_deploy_user` | — | デプロイ用 IAM ユーザー作成 | `true` |

> **`frontend_origins`（Terraform）と `FRONTEND_ORIGIN`（GitHub Variable）は同じ origin 一覧に揃えてください。** Lambda Function URL の CORS と API 内 CORS の両方で参照されます。

### Lambda 実行時環境変数（GitHub Actions が設定）

| 変数 | ソース | 説明 |
|---|---|---|
| `NODE_ENV` | CI 固定 | `production` |
| `DATABASE_DRIVER` | CI 固定 | `neon` |
| `DATABASE_URL` | GitHub Secret | Neon 接続文字列 |
| `SESSION_SECRET` | GitHub Secret | JWT Cookie 署名鍵（32 文字以上） |
| `AUTH0_DOMAIN` | GitHub Secret | Auth0 テナント |
| `AUTH0_CLIENT_ID` | GitHub Secret | Auth0 Client ID |
| `AUTH0_CLIENT_SECRET` | GitHub Secret | Auth0 Client Secret |
| `FRONTEND_ORIGIN` | GitHub Variable | カンマ区切り editor / runtime origin |

---

## 3. Auth0

### 要件

- **Regular Web Application**（Authorization Code + Client Secret を API 側で使用）
- Callback URL に Lambda Function URL を登録

### 手順

1. Auth0 ダッシュボードで Application を作成
2. 以下を設定:

| 設定項目 | 値 |
|---|---|
| Allowed Callback URLs | `terraform output api_auth_callback_url` の値<br>例: `https://xxx.lambda-url.ap-northeast-1.on.aws/api/auth/callback` |
| Allowed Logout URLs | editor の URL<br>例: `https://editor.example.com` |
| Allowed Web Origins | `FRONTEND_ORIGIN` と同じ origin（カンマ区切り可） |

3. Domain / Client ID / Client Secret を GitHub Secrets に登録

### 環境変数

| 変数 | 設定先 |
|---|---|
| `AUTH0_DOMAIN` | GitHub Secret → Lambda |
| `AUTH0_CLIENT_ID` | GitHub Secret → Lambda |
| `AUTH0_CLIENT_SECRET` | GitHub Secret → Lambda |

---

## 4. Cloudflare Pages

### 要件

- Cloudflare アカウント
- **Pages プロジェクト 2 つ**（editor / runtime 別）
- API Token（Pages 編集権限）

### 手順

1. Cloudflare ダッシュボード → Pages → プロジェクトを2つ作成
   - 例: `rpg2d-editor`, `rpg2d-runtime`
2. カスタムドメイン（MyDNS 等）を各プロジェクトに割り当て
   - 例: `editor.xxx.mydns.jp`, `play.xxx.mydns.jp`
3. API Token を発行 → GitHub Secret `CLOUDFLARE_API_TOKEN`
4. Account ID を GitHub Variable `CLOUDFLARE_ACCOUNT_ID` に登録

### runtime 固有の要件

- `apps/runtime/public/_headers` により **COOP/COEP** ヘッダを付与（SharedArrayBuffer 用）
- ビルド時に `write-runtime-config.mjs` が `public/config.js` を生成し API URL を注入

### editor 固有の要件

- ビルド時に `VITE_API_BASE_URL` を Lambda Function URL に設定
- API 呼び出しは `credentials: 'include'`（Cookie セッション）

### GitHub Variables

| 変数 | 説明 | 例 |
|---|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID | — |
| `CLOUDFLARE_PAGES_PROJECT_EDITOR` | editor プロジェクト名 | `rpg2d-editor` |
| `CLOUDFLARE_PAGES_PROJECT_RUNTIME` | runtime プロジェクト名 | `rpg2d-runtime` |
| `VITE_API_BASE_URL` | Lambda Function URL（末尾 `/` なし） | `https://xxx.lambda-url.ap-northeast-1.on.aws` |

---

## 5. GitHub Actions

### ワークフロー

| ファイル | トリガー | 内容 |
|---|---|---|
| `.github/workflows/deploy.yaml` | `main` push / 手動 | 本番デプロイ一式 |
| `.github/workflows/pages.yaml` | `main` push | runtime mock デモ（GitHub Pages） |
| `.github/workflows/ci.yaml` | push / PR | lint + test |

### 本番デプロイ (`deploy.yaml`) ジョブ

| ジョブ | 内容 |
|---|---|
| `migrate` | Neon へ DB マイグレーション |
| `deploy-api` | Lambda バンドル build → コード・環境変数更新 |
| `deploy-editor` | editor build → Cloudflare Pages |
| `deploy-runtime` | runtime config 生成 + build → Cloudflare Pages |

GitHub **Environment 名: `production`** を作成し、以下を登録します。

### Secrets

| 名前 | 用途 |
|---|---|
| `DATABASE_URL` | Neon 接続文字列 |
| `SESSION_SECRET` | セッション Cookie 署名（`openssl rand -base64 32` 推奨） |
| `AUTH0_DOMAIN` | Auth0 テナント |
| `AUTH0_CLIENT_ID` | Auth0 Client ID |
| `AUTH0_CLIENT_SECRET` | Auth0 Client Secret |
| `AWS_ACCESS_KEY_ID` | Lambda デプロイ用 IAM キー |
| `AWS_SECRET_ACCESS_KEY` | Lambda デプロイ用 IAM シークレット |
| `CLOUDFLARE_API_TOKEN` | Cloudflare Pages デプロイ |

### Variables

| 名前 | 用途 | 例 |
|---|---|---|
| `AWS_REGION` | AWS リージョン | `ap-northeast-1` |
| `AWS_LAMBDA_FUNCTION_NAME` | Lambda 関数名 | `RPG2d-api` |
| `FRONTEND_ORIGIN` | CORS / OAuth 許可 origin（**カンマ区切り**） | `https://editor.example.com,https://play.example.com` |
| `VITE_API_BASE_URL` | API の公開 URL | `https://xxx.lambda-url.ap-northeast-1.on.aws` |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID | — |
| `CLOUDFLARE_PAGES_PROJECT_EDITOR` | editor Pages プロジェクト名 | `rpg2d-editor` |
| `CLOUDFLARE_PAGES_PROJECT_RUNTIME` | runtime Pages プロジェクト名 | `rpg2d-runtime` |

---

## 環境変数対照表

| 変数 | ローカル `.env` | Lambda | editor build | runtime build | Terraform |
|---|---|---|---|---|---|
| `DATABASE_URL` | Docker Postgres | Secret | — | — | — |
| `DATABASE_DRIVER` | 省略 (`pg`) | `neon` (CI) | — | — | — |
| `SESSION_SECRET` | 任意 | Secret | — | — | — |
| `AUTH0_*` | 必須 | Secret | — | — | — |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Variable | — | — | `frontend_origins` |
| `VITE_API_BASE_URL` | 省略（プロキシ） | — | Variable | Variable | output `api_lambda_function_url` |

---

## ローカル開発 vs 本番

| 項目 | ローカル | 本番 |
|---|---|---|
| API | `pnpm dev:api` (:3000) | AWS Lambda |
| DB | Docker Postgres | Neon |
| DB driver | `pg` | `neon` |
| editor | `pnpm dev:editor` (:5173) | Cloudflare Pages |
| runtime | `pnpm dev:runtime` (:5174) | Cloudflare Pages |
| API 接続 | editor Vite プロキシ (`/api`) | `VITE_API_BASE_URL` 直結 |
| セッション | 署名 Cookie（共通） | 署名 Cookie（共通） |

---

## 初回チェックリスト

- [ ] Neon プロジェクト作成 + `pnpm db:migrate`
- [ ] `infra/aws` で `terraform apply`
- [ ] Auth0 Callback / Logout URL 設定
- [ ] Cloudflare Pages プロジェクト 2 つ + カスタムドメイン
- [ ] GitHub `production` environment に Secrets / Variables 登録
- [ ] `FRONTEND_ORIGIN` と Terraform `frontend_origins` を一致させる
- [ ] `VITE_API_BASE_URL` = `terraform output api_lambda_function_url`
- [ ] `main` push または Deploy workflow 手動実行
- [ ] editor からログイン → `/api/auth/me` 確認
- [ ] runtime を `?mode=api` で API 接続確認

---

## トラブルシュート

| 症状 | 確認ポイント |
|---|---|
| ログイン後すぐ未ログイン | `SESSION_SECRET` が Lambda に設定されているか |
| CORS エラー | `FRONTEND_ORIGIN` / Terraform `frontend_origins` の一致 |
| Auth0 redirect 失敗 | Callback URL が Function URL + `/api/auth/callback` と完全一致 |
| DB 接続失敗 | `DATABASE_URL` の `sslmode=require`、`DATABASE_DRIVER=neon` |
| runtime が真っ黒 / SAB エラー | Cloudflare で `_headers`（COOP/COEP）が配信されているか |
| Lambda 503 placeholder | GitHub Actions `deploy-api` が成功しているか |
