# Google Doc → サイト公開

半自動 publish: Docs から Markdown を生成し、Git コミット（+ 任意で push）する。

publish スクリプトは **`~/Projects/ahtr/scripts/`** にあります（OAuth・`contributors.yaml` も同リポジトリ）。

## 前提

- OAuth 設定済み（`~/Projects/ahtr/credentials/token.json`）
- `~/Projects/ahtr/config/contributors.yaml` に編集者を登録
- 本番 Hugo リポジトリ: **`ahtr-media/ahtr-media.github.io`**

## Google Doc の書き方（冒頭メタ）

```
title: 記事タイトル
date: 2026-06-05
category: はじめに
---
本文をここから書く
```

## 公開コマンド

```bash
cd ~/Projects/ahtr
source .venv/bin/activate

python scripts/publish_from_docs.py \
  --repo ~/Sites/ahtr.github.io \
  --doc-id "Google Doc の ID" \
  --slug my-article \
  --message "初稿：タイトル" \
  --author-email editor@example.com \
  --push
```

| オプション | 説明 |
|------------|------|
| `--repo` | 省略時は `~/Sites/ahtr.github.io` |
| `--doc-id` | 省略時は `.env` の `AHTR_TEST_DOC_ID` |
| `--slug` | 省略時は Doc タイトルから自動生成 |
| `--message` | コミットメッセージ（タイムラインに表示） |
| `--author-email` | 省略時は前回公開以降の revisions から候補を表示 |
| `--dry-run` | ファイル書き込み・commit なし |
| `--push` | `git pull --rebase` のあと `git push` まで実行 |

## 作者（by ○○）

1. 対象 Markdown の **前回 commit 以降**の Drive revisions を取得
2. 編集者メールを `contributors.yaml` と照合 → **表示名**を候補表示
3. Git commit の author.name = **display_name**（サイトタイムラインに表示）

## 確認

1. GitHub Actions が緑になる
2. https://ahtr-media.github.io/posts/{slug}/
3. 記事下タイムラインにメッセージと **by 表示名**

## 関連（ローカル）

- `~/Projects/ahtr/docs/gcp-setup.md` — Google Cloud 設定
- `~/Projects/ahtr/docs/HANDOVER.md` — 引き継ぎ・権限
