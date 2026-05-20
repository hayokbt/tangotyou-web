# tangotyo-web

Webで動く単語帳アプリケーションです。フロントエンドとバックエンドが別ディレクトリに分かれた構成で、Next.jsとGoで動作します。

## 構成

- `app-next/`
  - Next.js 16
  - React 19
  - TypeScript
  - Tailwind CSS
  - フロントエンドからGoバックエンドへローカルAPI経由でリクエストを中継します
- `app-go/`
  - Go 1.26
  - SQLite (`modernc.org/sqlite`)
  - セッション管理
  - アカウントおよび単語帳 CRUD

## バックエンド API

`app-go/main.go` で公開されるエンドポイント:

- `POST /account/create` — 新規アカウント作成
- `POST /account/login` — ログイン
- `POST /account/logout` — ログアウト
- `GET /account/me` — 現在のログイン状態確認
- `GET|POST|DELETE /account/books` — ブック一覧取得、追加、削除
- `GET|POST|PUT|DELETE /account/books/{bookName}/words` — 指定ブック内の単語一覧取得・作成・更新・削除

## 実行手順

### 1. バックエンドを起動

```bash
./app-go
go run main.go
```

バックエンドは `http://127.0.0.1:8080` で待ち受けます。

### 2. フロントエンドを起動

```bash
cd app-next
npm install
npm run dev
```

その後、ブラウザで `http://localhost:3000` を開きます。

## フロントエンドのポイント

- `app-next/src/app/api` 以下に Next.js API ルートがあり、Goバックエンドへリクエストを転送します
- `app-next/src/data/access.ts` にバックエンドのオリジン設定があります
- ログインやアカウント作成では `axios` を、その他の API では `fetch` を利用しています
- クッキーを使ったセッション連携のため、リクエストに `credentials: "include"` / `withCredentials: true` を使います

## 開発サポート

- フロントエンドのビルド: `cd app-next && npm run build`
- フロントエンドの lint: `cd app-next && npm run lint`

## 備考

このリポジトリは `app-next` と `app-go` の2つのアプリケーションから構成され、フロントエンドとバックエンドの連携を前提とした単語帳アプリです。