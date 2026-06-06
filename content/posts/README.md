# 記事ディレクトリ（Page Bundle）

```
content/posts/{slug}/
  index.md      ← publish スクリプトが生成
  top.jpg       ← トップ画像（手動配置）
  *.jpg / *.png ← 本文用画像（手動配置）
```

- **記事フォルダ** … Doc の `slug:` または `--slug`
- **URL** … `https://ahtr-media.github.io/posts/{slug}/`（カテゴリは URL に含めない）
- **カテゴリ** … Doc 冒頭の `category:` → frontmatter のみ（サイトの taxonomy 用）

本文から画像を参照するときは **同じフォルダ内の相対パス**:

```markdown
![](top.jpg)
![](figure-01.png)
```
