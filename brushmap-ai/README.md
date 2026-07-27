# BrushMap AI

React Native / Expo / TypeScript で作成した、ブラッシング動作の見える化アプリのMVPです。
医療診断ではなく、歯みがきフォーム改善と習慣化支援を目的にしています。

## MVPでできること

- 起動画面からブラッシングセッションを開始
- インカメラを端末内プレビュー表示
- 2分タイマーと30秒ごとのガイド部位表示
- 手動タップによるブラッシング部位記録
- セッション終了後の結果表示
- 各部位の時間集計
- ヒートマップ風表示
- 磨き順序タイムライン
- AsyncStorage へのローカル保存
- AI推定ログの保存と履歴詳細での可視化

## MVPの現在地

- UX・習慣化MVPとして試用できる状態です
- AI自動判定はまだルールベースと疑似入力中心で、精密判定MVPの前段階です
- 小規模テストでは「2分続けやすいか」「手動記録が続けられるか」「結果が振り返りに役立つか」の確認に向いています

## 技術構成

- Expo
- React Native
- TypeScript
- `expo-camera`
- `@react-native-async-storage/async-storage`
- 状態管理: `useState`

## AI入力の土台

- `ai/frameFactory.ts` で AI に渡す `AISensorFrame` を一元生成
- `ai/adapters/mediapipeHandsAdapter.ts` で MediaPipe Hands の生データを `HandObservation` に変換
- `ai/adapters/faceDetectionAdapter.ts` で Face Detection の生データを `FaceMouthObservation` に変換
- `ai/rules/zoneEstimation.ts` で手と口元の相対位置から部位候補を返すルールベース推定を提供
- カメラ状態は `CameraTelemetry` として保持
- 将来の MediaPipe Hands / Face Detection の検出結果を `detections` に差し込める構成
- 現在は疑似的な手・口元情報を生成し、推定パイプラインの土台として利用

## 画面構成

### 1. ホーム画面

- アプリ名表示
- `ブラッシングを開始` ボタン
- 注意書き
- 保存済みセッション数
- 前回セッション概要

### 2. ブラッシング画面

- インカメラ表示
- 2分タイマー
- 30秒ごとのガイド部位切り替え
- 手動記録ボタン
- 一時停止 / 再開 / 終了

### 3. 結果画面

- 総ブラッシング時間
- コメント
- 部位別ヒートマップ
- タイムライン
- 部位別秒数

## データ構造

```ts
type BrushZone =
  | "upperRight"
  | "upperFront"
  | "upperLeft"
  | "lowerRight"
  | "lowerFront"
  | "lowerLeft";

type BrushEvent = {
  zone: BrushZone;
  timestamp: number;
};

type BrushSession = {
  id: string;
  startedAt: string;
  durationSec: number;
  events: BrushEvent[];
  zoneDurations: Record<BrushZone, number>;
};
```

## 起動方法

### 1. 依存関係をインストール

```bash
cd brushmap-ai
npm install
npx expo install expo-camera @react-native-async-storage/async-storage react-native-safe-area-context
```

### 2. アプリを起動

```bash
npm run start
```

必要に応じて:

```bash
npm run ios
npm run android
npm run web
```

Web公開用の静的ファイルを出力する場合:

```bash
npm run export:web
```

ローカルで書き出し結果を確認する場合:

```bash
npm run preview:web
```

## 公開方法

### 1. Webで共有する

- `npm run export:web` で `dist/` を生成
- `dist/` を Netlify / Vercel / Cloudflare Pages / GitHub Pages などの静的ホスティングへ配置
- `netlify.toml` と `vercel.json` を同梱しているため、Netlify / Vercel ではそのまま設定しやすい構成です
- UI確認、説明なしで使えるか、履歴や結果が分かるかの検証に向いています

### 2. スマホ実機で共有する

- `eas.json` の `preview` プロファイルで内部配布ビルドを作成
- Android は内部配布APK、iOS は Ad Hoc の内部配布を想定
- 実際のカメラ体験、通知、操作感の検証に向いています

代表コマンド:

```bash
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform ios --profile preview
```

初回のiOS配布では、配布対象端末の登録が必要です:

```bash
npx eas-cli device:create
```

補足:

- この環境では `npx eas-cli whoami` の結果が `Not logged in` だったため、実際の内部配布ビルド実行には Expo ログインが必要です
- iOS の内部配布には Apple Developer Program の設定も必要です

## プライバシー方針

- カメラ映像はその場のプレビュー表示のみに使用
- 画像・動画は保存しない
- 外部サーバー送信なし
- セッションデータは端末内に保存

## 今後のAI実装ロードマップ

### Phase 1: ルールベース補助

- 手動記録とガイド部位のズレを簡易分析
- 記録頻度に応じた精度表示
- 習慣化スコア追加

### Phase 2: 端末内推定

- MediaPipe Handsで歯ブラシを持つ手の位置を推定
- Face Detectionで口元位置を推定
- 手と口元の相対位置から部位候補を推定
- 手動記録を教師データとして補助学習

### Phase 3: デバイス連携

- Apple Watch モーションセンサーとの組み合わせ
- 電動歯ブラシBluetoothデータ連携
- ストローク強度やリズムの可視化

### Phase 4: 継続支援

- 家族アカウント
- 子ども向けモード
- 歯科医監修コメント機能
- 週次・月次の磨きバランスレポート

## 実装メモ

- MVPではAI自動判定は未実装です
- 部位時間は手動タップの区間差分から推定しています
- 終了直前の最後のタップはセッション終了時刻まで継続したものとして集計します
