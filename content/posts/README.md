---
build:
  render: never
  list: never
---
# 記事ディレクトリ（Page Bundle）

```
content/posts/{slug}/
  index.md      ← publish スクリプトが生成
  hero.jpg      ← ヒーロー（推奨）
  top.jpg       ← 一覧カード用（任意。片方のみなら共用）
  *.jpg / *.png ← 本文用
```

- **記事フォルダ** … Doc の `slug:` または `--slug`
- **URL** … 通常 `https://ahtr-media.github.io/posts/{slug}/`（`permalink:` で別 URL も可）
- **カテゴリ** … Doc 冒頭の `category:` → frontmatter のみ

**画像・キャプション・スナップ写真**の詳細は [docs/content-guide.md](../../docs/content-guide.md) を参照。
