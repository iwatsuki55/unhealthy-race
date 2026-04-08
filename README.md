# アンヘルシーレース（仮）

Next.js + Tailwind CSS + Supabase で作る、生活習慣の乱れを見える化し、健康行動で少しずつ整え直していくための Web アプリです。

## 現在の進捗

Step 1 を実装済みです。

- Next.js App Router 前提の初期構成
- Tailwind CSS 設定
- Supabase 接続ユーティリティの追加
- ログイン画面の土台作成
- `.env.example` の追加

Step 2 を実装済みです。

- Supabase Auth を使ったメール登録 / ログイン
- 認証済みユーザーの画面遷移
- `/profile/setup` の保護
- ログアウト処理

Step 3 を実装済みです。

- `profiles` / `actions` / `action_logs` の SQL 追加
- `actions` の seed データ追加
- 初回プロフィール設定フォーム追加
- プロフィール保存後の仮ホーム画面追加

## 前提環境

- Node.js 20 以上
- npm 10 以上

## セットアップ

1. Node.js をインストールします。
2. このディレクトリで依存関係をインストールします。

```bash
npm install
```

3. 環境変数ファイルを作成します。

```bash
cp .env.example .env.local
```

4. `.env.local` に Supabase の URL と Anon Key を設定します。
5. 開発サーバーを起動します。

```bash
npm run dev
```

6. ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## Supabase Auth の事前設定

1. Supabase プロジェクトを作成します。
2. `Authentication` で Email プロバイダーを有効にします。
3. ローカルで登録後すぐに遷移確認したい場合は、メール確認を一時的にオフにします。
4. `.env.local` に `Project URL` と `anon public key` を設定します。

## Step 3 の SQL 適用

Supabase ダッシュボードの `SQL Editor` で、次の順に実行してください。

1. [supabase/migrations/202604081000_step3_init.sql](/Users/hidetakaiwatsuki/Library/Mobile%20Documents/com~apple~CloudDocs/Codex/supabase/migrations/202604081000_step3_init.sql)
2. [supabase/seed.sql](/Users/hidetakaiwatsuki/Library/Mobile%20Documents/com~apple~CloudDocs/Codex/supabase/seed.sql)

これにより、プロフィール保存と今後の行動マスタ取得に必要なテーブルが作成されます。

## ディレクトリ構成

```text
app/
  home/
  login/
  profile/setup/
  globals.css
  layout.tsx
  page.tsx
lib/
  profile-options.ts
  profile-server.ts
  supabase/
  env.ts
supabase/
  migrations/
  seed.sql
middleware.ts
```

## 環境変数

| 変数名 | 用途 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase の公開 Anon Key |

## 今後の実装予定

- Step 4: 行動登録画面と保存処理
- Step 5: ポイント計算ロジックと制限ルール
- Step 6 以降: ホーム、履歴、週次推移
