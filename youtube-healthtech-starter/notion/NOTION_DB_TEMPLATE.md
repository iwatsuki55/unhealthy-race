# Notion DB Template

データベース名の例: `YouTube Production`

## プロパティ一覧

| Name | Type | Example | Purpose |
| --- | --- | --- | --- |
| `企画名` | Title | 病院DXの導入で最初に詰まりやすい3点 | 動画の主タイトル |
| `ステータス` | Select | Idea | 進行管理 |
| `チャンネル` | Select | Healthtech Notes | チャンネル切り分け |
| `動画タイプ` | Select | 解説 | 比較、解説、ニュース、事例など |
| `ターゲット` | Text | 病院経営者、医療職、医療IT担当 | 想定視聴者 |
| `尺` | Select | 90秒 | 想定動画尺 |
| `企画メモ` | Text | 導入ハードルを非技術者向けに整理する | ざっくり意図 |
| `主張` | Text | 医療DXはツール導入より運用設計が先 | 1本の結論 |
| `リサーチ素材` | URL / Text | 参考記事URLや資料メモ | 根拠置き場 |
| `出典確認` | Checkbox | false | 根拠確認済みか |
| `医療監修要否` | Select | Review Needed | 監修が必要か |
| `注意書き` | Text | 一般的な情報であり個別診療の助言ではありません | 動画や概要欄に入れる文言 |
| `台本` | Long text |  | 本文 |
| `タイトル案` | Long text |  | 候補を複数 |
| `概要欄` | Long text |  | 投稿説明文 |
| `サムネ文言` | Text | 失敗する病院DX | サムネ訴求文 |
| `素材指示` | Long text | 白背景の病院受付、電子カルテUI風 | 画像やB-rollの指示 |
| `音声ファイル` | Files / URL |  | TTS出力先 |
| `動画ファイル` | Files / URL |  | mp4出力先 |
| `サムネファイル` | Files / URL |  | サムネ出力先 |
| `公開設定` | Select | private | 公開状態 |
| `公開予定日` | Date |  | 予約日時 |
| `YouTube URL` | URL |  | 投稿後URL |
| `KPIメモ` | Long text | CTR 4.2%, 維持率 51% | 公開後メモ |
| `作成日` | Created time |  | 自動 |
| `更新日` | Last edited time |  | 自動 |

## `ステータス` の候補

- `Idea`
- `Research`
- `Script`
- `Medical Review`
- `Generate`
- `Review`
- `Uploaded`
- `Published`

## `動画タイプ` の候補

- `解説`
- `比較`
- `ニュース`
- `事例`
- `ランキング`
- `用語整理`

## `医療監修要否` の候補

- `Not Needed`
- `Review Needed`
- `Reviewed`

## コピペ用の1行テンプレ

```text
企画名:
ステータス: Idea
チャンネル:
動画タイプ:
ターゲット:
尺:
企画メモ:
主張:
リサーチ素材:
出典確認: false
医療監修要否: Review Needed
注意書き:
台本:
タイトル案:
概要欄:
サムネ文言:
素材指示:
公開設定: private
公開予定日:
YouTube URL:
KPIメモ:
```

## ページ本文テンプレ

```text
# 目的
この動画で視聴者に何を理解してほしいか

# 想定視聴者
誰向けか

# 結論
この動画で一番伝えたいこと

# 構成
導入
論点1
論点2
論点3
まとめ

# 根拠
出典URL
出典URL

# 注意
一般情報であり、個別の診断・治療の推奨は行わない
誤認を招くサムネを使わない
```
