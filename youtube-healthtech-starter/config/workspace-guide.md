# Workspace Guide

## 基本ルール

- 1チャンネルにつき1ワークスペース
- 1動画につき1つのスラッグを使う
- アップロード前の動画は `output/drafts/` に置く
- 投稿確定版だけ `output/final/` に置く

## 命名ルール

```text
YYYY-MM-DD_topic-slug
```

例:

```text
2026-05-08_hospital-dx-common-failures
```

## 推奨ファイル対応

- `data/scripts/<slug>.md`
- `data/metadata/<slug>.json`
- `assets/voice/<slug>.wav`
- `assets/thumbnails/<slug>.png`
- `output/drafts/<slug>.mp4`

## 公開前チェック

- 出典確認済みか
- 個別医療助言に見えないか
- タイトルと内容が一致しているか
- サムネが誇張しすぎていないか
- 注意書きが入っているか
