# AI議事録作成ツール MVP

病院・医療法人の情報システム会議音声から、文字起こし、経営層向け議事録生成、Markdown/docx出力を行うローカルStreamlitアプリです。

## 機能

- `.m4a`, `.mp3`, `.wav` の音声ファイル選択またはドラッグ＆ドロップ
- OpenAI APIによる日本語会議の文字起こし
- 長時間音声の分割処理
- 専門用語辞書による表記補正
- 経営層向けの議事録Markdown生成
- MarkdownとWord（docx）の保存・ダウンロード
- 処理ステータスとエラーメッセージ表示

## セットアップ

```bash
cd ai-minutes-mvp
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

`.env` にOpenAI APIキーを設定してください。

```env
OPENAI_API_KEY=sk-your-openai-api-key
```

`.m4a` や `.mp3` の読み込みには同梱依存の `imageio-ffmpeg` を使用します。通常はMac本体に `ffmpeg` を別途インストールしなくても動作します。

## 起動

```bash
streamlit run app.py
```

ブラウザで表示されたローカルURLを開き、音声ファイルをアップロードしてください。

## 出力

生成物は `outputs/` 配下の実行ごとのフォルダに保存されます。同じ日に複数回作成しても、前回の議事録を上書きしないように作成時刻と元音声ファイル名を付けます。

- `outputs/YYYYMMDD_HHMMSS_元音声名/情報システム会議_YYYYMMDD_HHMMSS_元音声名.md`
- `outputs/YYYYMMDD_HHMMSS_元音声名/情報システム会議_YYYYMMDD_HHMMSS_元音声名.docx`
- `outputs/YYYYMMDD_HHMMSS_元音声名/情報システム会議_YYYYMMDD_HHMMSS_元音声名_transcript.txt`

`_transcript.txt` は補正後の文字起こしです。議事録に音声外の内容が混ざっていないか確認するために使えます。

## 専門用語辞書

`terms_dictionary.json` を編集すると、文字起こし後の表記補正を追加できます。

例:

```json
{
  "ラインワークス": "LINE WORKS",
  "ホープライフマーク": "HOPE LifeMark"
}
```

## 注意

- 音声ファイルのサイズや長さにより処理時間がかかります。
- API利用料金はOpenAI APIの利用量に応じて発生します。
- 個人情報や機微情報を含む音声を扱う場合は、所属組織のセキュリティポリシーに従ってください。
