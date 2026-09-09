# Articles

Each article is a self-contained directory under `content/articles`. Its
`index.md` file supplies both the article page and the metadata used by the
home page and article index. The build discovers these directories
automatically, so adding a normal article does not require a TypeScript edit.

```text
content/articles/
  article-slug/
    index.md
    hero.png
    another-image.png
```

The directory name becomes the URL slug. Frontmatter is intentionally flat:
strings, numbers, and booleans are supported. Invalid records fail the build.

Required frontmatter:

- `headline`, `project`, and `summary`
- `published`: `true` to include the article in listings, `false` to keep it
  unlisted while leaving its direct URL available for previews

Optional frontmatter:

- `date`: use `YYYY-MM-DD`; the article index sorts dated articles newest first
- `home`: `lead`, `secondary`, or `none` (the default)
- `homeOrder`: required when `home` is not `none`
- `homeTreatment`: `full` or `excerpt` (the default)

One published home-page article must be marked `home: lead`. The other selected
home-page articles use `home: secondary`. Articles marked `home: none` still
appear in `/articles` when published.

An optional hero image uses `image`, `imageAlt`, `imageWidth`, and
`imageHeight`; `imageCaption` is optional. Put the image beside `index.md` and
reference it relatively:

```yaml
image: ./hero.png
imageAlt: A pig monitoring a server rack
imageCaption: Transfer supervision in progress.
imageWidth: 900
imageHeight: 600
```

Ordinary Markdown images in the article body can also use local paths such as
`![A transfer diagram](./diagram.png)`. Local image references are resolved at
build time and emitted as static assets.

`published: false` is an unlisted preview, not an access-control mechanism.
Anyone with its direct URL can read it. Unlisted article pages emit `noindex`
metadata.
