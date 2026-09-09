# Articles

Each article is a self-contained directory under `content/articles`. Its
`index.md` file supplies both the article page and the metadata used by the
home page. The build discovers these directories
automatically, so adding a normal article does not require a TypeScript edit.

```text
content/articles/
  article-slug/
    index.md
    hero.png
    another-image.png
```

The directory name becomes the URL slug. Astro validates the frontmatter as a
typed content collection, and invalid records fail the build.

Required frontmatter:

- `headline`, `project`, `date`, and `summary`
- `published`: `true` to include the article in listings, `false` to keep it
  unlisted while leaving its direct URL available for previews

Published articles are sorted newest-first. The home page automatically places
an incomplete group of one or two newest articles first, then renders complete
groups of three with alternating lead-story placement.

An optional hero image uses `image` and `imageAlt`; `imageCaption` is optional.
Astro reads the dimensions from the source file and generates responsive image
variants. Put the image beside `index.md` and reference it relatively:

```yaml
image: ./hero.png
imageAlt: A pig monitoring a server rack
imageCaption: Transfer supervision in progress.
```

Ordinary Markdown images in the article body can also use local paths such as
`![A transfer diagram](./diagram.png)`. Local image references are resolved at
build time and emitted as static assets.

`published: false` is an unlisted preview, not an access-control mechanism.
Anyone with its direct URL can read it. Unlisted article pages emit `noindex`
metadata.
