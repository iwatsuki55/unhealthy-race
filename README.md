# アンヘルシーレース（仮）

Next.js + Tailwind CSS + Supabase で作る、生活習慣の乱れを見える化し、健康行動で少しずつ整え直していくための Web アプリです。

## 本番URL

[https://unhealthy-race.vercel.app](https://unhealthy-race.vercel.app)

## 現在のリリース概要

現行版では、生活習慣の乱れを記録して見える化する基本機能に加えて、友達やライバルと同じレースに参加して比較できるところまで実装済みです。

- メール登録 / ログイン
- 初回プロフィール設定
- 不健康行動 / 健康行動の登録
- ポイント計算と制限ルール
- ホーム、履歴、今週の推移表示
- レース開始による実質リセット
- 招待コードによる友達 / ライバル参加
- ランキング表示と `🥇🥈🥉` 演出
- コメントトーン切り替え
- 共有用サマリー
- 終了予定日、終了待ち、終了トリガーの見える化
- 前回レース結果表示

## レース機能の現在仕様

- レースは 7日 / 14日 / 30日 から選択して開始できます。
- 新しいレースを開始すると、前回レースは終了扱いになります。
- 過去ログは削除されず、過去レースとして残ります。
- 終了予定日を過ぎると `終了待ち` として表示されます。
- 終了待ち中でも記録は続けられますが、順位とポイントは暫定です。
- オーナーが次のレースを開始した時点で結果が確定します。

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

Step 9 を実装済みです。

- `races` / `race_members` を追加
- `action_logs` に `race_id` を追加
- 現在のレースを自動取得 / 自動作成する仕組みを追加
- ホーム、履歴、行動登録を現在のレース単位で集計するよう変更

Step 10 を実装済みです。

- 新しいレースを開始するフォームを追加
- 既存レースをアーカイブして、新レースを開始する処理を追加
- ログ削除なしでポイントをゼロから再スタートできるよう変更

Step 11 を実装済みです。

- 招待コード発行機能を追加
- 招待コードでレース参加する機能を追加
- 友達 / ライバルの参加種別を選べるよう追加

Step 12 を実装済みです。

- ホーム画面にレース参加メンバーの比較表示を追加
- 参加メンバーの現在ポイントと順位を表示
- ライバルがいるレースでは、コメントを少し皮肉寄りに切り替えるよう追加

Step 13 を実装済みです。

- ホーム上部に順位、トップとの差、ライバルとの差を追加
- ライバル向けコメントのパターンを増やし、対戦感を強化
- 既存の比較表示を保ったまま、対戦ホームらしい見え方に調整

Step 14 を実装済みです。

- `profiles.comment_tone` を追加
- 初回プロフィール設定でコメントトーンを選べるよう追加
- ホームからコメントトーンを更新できるよう追加
- `やさしめ` / `皮肉多め` の切り替えに対応

Step 15 を実装済みです。

- ホームのランキング演出を強化
- トップ3を見やすく表示
- 各メンバーに `優勝候補` や `追い上げ圏` などのラベルを追加

Step 16 を実装済みです。

- ランキング表示に `🥇🥈🥉` を追加
- `友達` と `ライバル` の見え方をさらに分岐
- 前回レースの勝敗が分かる結果カードを追加

Step 17 を実装済みです。

- スクリーンショット共有向けの `共有用サマリー` カードを追加
- 現在順位、トップ差、ライバル差、今日の増減を1枚に集約
- 上位3人を共有カード内でも見やすく表示

Step 18 を実装済みです。

- 新しいレース開始直後に、前回結果をモーダル風に強調表示
- 共有用サマリーにレース名と期間感を追加
- 共有カードのスクリーンショット用途をさらに強化

Step 19 を実装済みです。

- 前回結果を閉じる UI を追加
- ホームにレース終了ルールを明示
- 結果確定のタイミングが分かる説明を追加

Step 20 を実装済みです。

- ホーム上部に現在レースの終了予定日を表示
- 終了目安までの残り日数を表示
- レース終了ルールを終了予定日ベースでも読めるよう改善

Step 21 を実装済みです。

- 終了が近いレースをホーム上で強調表示
- レース終了トリガーが自分かオーナーかを表示

Step 22 を実装済みです。

- 新しいレース開始時に 7日 / 14日 / 30日 の期間を選択可能
- ホームの終了予定表示を実際の `end_at` ベースに変更

Step 23 を実装済みです。

- 共有用サマリーにも終了間近の演出を追加
- レース参加メンバー一覧にも締切が近い案内を追加

Step 24 を実装済みです。

- 終了予定日を過ぎたレースを `終了待ち` として表示
- オーナーには `このレースを終了して次へ進む` 導線を強調表示

Step 25 を実装済みです。

- 参加者側にも `終了待ち` を大きく表示
- 終了トリガー表示をオーナーのニックネームベースに変更

Step 26 を実装済みです。

- 終了待ちカード内に暫定順位とトップ差を表示
- 終了トリガーを終了待ちカード内でも確認可能に改善

Step 27 を実装済みです。

- 終了待ち中でも記録は継続できることを明示
- 行動登録画面でも `暫定記録` の案内を追加

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

Seed 済みの行動マスタには、`歩かなかった`、`午前中から飲んだ`、`運動した`、
`ヨガやサウナでリフレッシュした` も含まれます。

## Step 9 の SQL 適用

Supabase ダッシュボードの `SQL Editor` で、
[supabase/migrations/202604101000_step9_races.sql](/Users/hidetakaiwatsuki/Library/Mobile%20Documents/com~apple~CloudDocs/Codex/supabase/migrations/202604101000_step9_races.sql)
を実行してください。

これにより、レース管理用の `races` / `race_members` と、
`action_logs.race_id` が追加されます。既存ログも現在の個人レースへ自動でひもづけられます。

## Step 11 の SQL 適用

Supabase ダッシュボードの `SQL Editor` で、
[supabase/migrations/202604101100_step11_race_invites.sql](/Users/hidetakaiwatsuki/Library/Mobile%20Documents/com~apple~CloudDocs/Codex/supabase/migrations/202604101100_step11_race_invites.sql)
を実行してください。

これにより、招待コード管理用の `race_invites` テーブルが追加されます。

## Step 12 の SQL 適用

Supabase ダッシュボードの `SQL Editor` で、
[supabase/migrations/202604101200_step12_profiles_shared.sql](/Users/hidetakaiwatsuki/Library/Mobile%20Documents/com~apple~CloudDocs/Codex/supabase/migrations/202604101200_step12_profiles_shared.sql)
を実行してください。

これにより、同じレースに参加しているメンバーどうしで、比較表示に必要なニックネームを参照できるようになります。

続けて、
[supabase/migrations/202604101210_step12_race_members_shared.sql](/Users/hidetakaiwatsuki/Library/Mobile%20Documents/com~apple~CloudDocs/Codex/supabase/migrations/202604101210_step12_race_members_shared.sql)
も実行してください。

これにより、同じレースに参加しているメンバーどうしで `race_members` を参照できるようになり、ホームの参加メンバー一覧が正しく表示されます。

もし Step 12 の途中でプロフィール保存やメンバー表示が不安定になった場合は、
[supabase/migrations/202604101220_step12_safe_rls.sql](/Users/hidetakaiwatsuki/Library/Mobile%20Documents/com~apple~CloudDocs/Codex/supabase/migrations/202604101220_step12_safe_rls.sql)
を追加で実行してください。比較表示に必要な RLS を安全な関数経由に置き換えます。

メンバー名は見えるのに他ユーザーのポイントが `0pt` のままの場合は、
[supabase/migrations/202604101230_step12_action_logs_shared.sql](/Users/hidetakaiwatsuki/Library/Mobile%20Documents/com~apple~CloudDocs/Codex/supabase/migrations/202604101230_step12_action_logs_shared.sql)
も実行してください。同じレースのメンバーどうしでポイント集計に必要な `action_logs` を参照できるようになります。

## Step 14 の SQL 適用

Supabase ダッシュボードの `SQL Editor` で、
[supabase/migrations/202604101300_step14_comment_tone.sql](/Users/hidetakaiwatsuki/Library/Mobile%20Documents/com~apple~CloudDocs/Codex/supabase/migrations/202604101300_step14_comment_tone.sql)
を実行してください。

これにより、プロフィールにコメントトーン設定が追加されます。

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
  race-invite-server.ts
  race-server.ts
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

- 次は対戦ホームの演出をさらに強め、コメントトーン切り替えやランキング体験を広げるフェーズ
