# コンテンツ運用ガイド（画像・スナップ）

記事の publish 手順（Google Docs → Markdown）は非公開リポジトリ `ahtr` の運用マニュアルを参照。ここでは **本リポジトリで手を入れる静的アセット** だけをまとめる。

## 記事ディレクトリ（Page Bundle）

```
content/posts/{slug}/
  index.md
  hero.jpg      ← 記事上部ヒーロー（推奨）
  top.jpg       ← 一覧カードの「+」内（任意）
  *.jpg / *.png ← 本文用（手動配置）
```

- **URL** … 通常は `/posts/{slug}/`。固定 URL が必要なら frontmatter に `url: /about/` のように書く。
- **カテゴリ** … frontmatter の `category:`（一覧・フィルタ用。URL には含めない）。

---

## 個別ページの画像

### ファイル名（hero / top）

| ファイル | 用途 |
|----------|------|
| **`hero.jpg`** | 記事上部のヒーロー（メイン） |
| **`top.jpg`** | トップ・カテゴリー一覧のカード内サムネ |

**どちらか一方だけ** 置いた場合は、**ヒーローと一覧の両方** でその1枚を使う。

両方あるときは、ヒーロー → `hero.jpg`、一覧 → `top.jpg`。

### キャプションの書き方（Markdown）

サイトは Markdown 画像の **第2引数（タイトル）** をキャプションとして表示する。

```markdown
![代替テキスト](hero.jpg "ヒーローに載せるキャプション")
![代替テキスト](figure-01.jpg "本文下に出すキャプション")
```

- **`![ ]` の括弧内** … `alt`（読み上げ・画像オフ用）
- **`"..."` の引用部分** … 画面のキャプション（`figcaption`）

`hero.jpg` / `top.jpg` を本文に上記の形で書いても、**本文中には重複表示しない**（ヒーローブロックだけに出る）。キャプション・alt の取得に使う。

frontmatter で上書きもできる（publish 向け）。

```yaml
hero_caption: "キャプション文"
hero_alt: "代替テキスト"
```

優先順位: **`hero_caption` / `hero_alt`** → Markdown の `![...](hero.jpg "...")`（または実際に使っている方のファイル名）

### 本文中（hero / top 以外）

同じフォルダへの相対パスで書く。

```markdown
![工場跡地の空撮](aerial-01.jpg "2024年当時の様子")
```

キャプション不要のときは第2引数を省略できる（`<figure>` 内に画像のみ）。

```markdown
![](inline.png)
```

### HTML で書く場合

従来どおり `<figure>` も使える（`hugo.toml` で `unsafe = true`）。

---

## スナップ写真（トップ・PC 背景・左サイド）

Google Doc には書かない。**画像ファイルと YAML を同じ PR** で追加する。

### 1. 画像を置く

```
static/snaps/ファイル名.jpg
```

### 2. メタデータを追加

`data/snaps.yaml` に1件追加する。

| 項目 | 説明 |
|------|------|
| `file` | `static/snaps/` 内のファイル名 |
| `caption` | 短い説明（スマホの枠内・PC 左下など） |
| `credit` | 撮影者・権利表記。空なら非表示 |
| `date` | 撮影年月。空なら非表示 |
| `alt` | 読み上げ用。`caption` と同じでよい |
| `background` | `true` を PC 全画面背景・トップのスナップに使う。複数 `true` は YAML 上から最大5枚（PC 背景は約8秒で自動切替、スマホのスナップ枠は `<` `>` とスワイプで手動） |
| `source` | 出典メモ（任意）。値にコロンが含まれるときは YAML で引用符で囲む |

例:

```yaml
- file: example.jpg
  caption: 説明文
  credit: "撮影: 氏名（出典）"
  date: "2026-04"
  alt: 説明文
  background: false
  source: "unsplash:xxxx"
```

### キャプションの表示場所

| 場所 | 表示内容 |
|------|----------|
| トップ（スマホ） | `caption` → `credit` → `date` を縦に重ね表示 |
| PC 左サイド下部 | 同じ snap の `caption` / `credit` / `date` |
| PC 背景 | `background: true` の `file` |

表示対象は **`background: true` を上から最大5件**（`layouts/partials/background-snaps.html`）。1件もなければ YAML 先頭1件。
