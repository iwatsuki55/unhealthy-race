# アンヘルシーレース（仮）

Next.js + Tailwind CSS + Supabase で作る、生活習慣の乱れを見える化し、健康行動で少しずつ整え直していくための Web アプリです。

## 現在の進捗

Step 1 を実装済みです。

- Next.js App Router 前提の初期構成
- Tailwind CSS 設定
- Supabase 接続ユーティリティの追加
- ログイン画面の土台作成
- `.env.example` の追加

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

## ディレクトリ構成

```text
app/
  login/
  globals.css
  layout.tsx
  page.tsx
lib/
  supabase/
  env.ts
```

## 環境変数

| 変数名 | 用途 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase の公開 Anon Key |

## 今後の実装予定

- Step 2: Supabase Auth による登録・ログイン
- Step 3: プロフィール設定と SQL 追加
- Step 4 以降: 行動登録、ポイント計算、履歴、週次推移
