# いつもわかっている途中 / Always halfway through realising

科研 AHTR「記述プラットフォーム」の公開サイト（Hugo + GitHub Pages）。

- **本番 URL:** https://ahtr.github.io/
- **原稿:** Google Docs → 半自動 publish → 本リポジトリ
- **運用ドキュメント:** [`docs/`](docs/)

## ローカルビルド

```bash
hugo server -D
```

## 公開フロー（概要）

1. Google Doc を執筆
2. `~/Projects/ahtr` の `publish_from_docs.py` で Markdown 生成・commit・push
3. GitHub Actions が Hugo をビルドし Pages にデプロイ

詳細は [`docs/publish-from-docs.md`](docs/publish-from-docs.md)。

## 関連

- 計画・publish スクリプト正本: `~/Projects/ahtr`（ローカル）
- Phase 1 PoC（参考）: `yamawooriru/yamawooriru.github.io`
