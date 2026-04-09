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

Step 4 を実装済みです。

- `actions` テーブルから行動一覧を取得
- 行動登録画面を追加
- メモ付きで `action_logs` に保存
- ホームから行動登録画面への導線を追加

Step 5 を実装済みです。

- 同じ行動の1日3回制限を追加
- 健康行動の1日減算上限 -30 を追加
- ポイント下限 0 の制御を追加
- 保存済みログから現在ポイントを再計算して表示

Step 6 を実装済みです。

- ホーム画面で現在ポイントを表示
- 今日の増減ポイントを表示
- 直近5件の登録行動を表示
- ルールベースのコメント表示を追加

Step 7 を実装済みです。

- 履歴一覧画面を追加
- 日付、行動名、健康/不健康区分、増減ポイント、メモを表示
- ホームから履歴一覧への導線を追加

Step 8 を実装済みです。

- ホーム画面に今週の推移を追加
- 日ごとの増減ポイントを簡易棒グラフで表示

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
  actions/new/
  home/
  history/
  login/
  profile/setup/
  globals.css
  layout.tsx
  page.tsx
lib/
  action-server.ts
  history-server.ts
  home-server.ts
  point-rules.ts
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

- MVP 実装はひと通り完了
