# Repository guide

## Project shape

This repository is Dylan's personal site. It is a small pnpm workspace with one
application: the Astro site in `apps/site`. Vercel deploys that directory. There
is currently no separate backend and no required environment configuration.

Useful paths:

- `apps/site/src/pages/index.astro` builds the home page and article grid.
- `apps/site/src/pages/articles/[slug].astro` builds individual article pages.
- `apps/site/src/components` contains the reusable Astro presentation pieces.
- `apps/site/src/styles.css` defines the global type, color tokens, and article
  link treatment.
- `apps/site/src/content.config.ts` is the authoritative article schema.
- `apps/site/content/README.md` is the authoring reference for articles.

## Articles

Articles are self-contained directories at
`apps/site/content/articles/<slug>/index.md`; the directory name is the URL
slug. The home page discovers them automatically, so a normal article should
not require a TypeScript registry change.

Follow the schema and examples in `apps/site/content/README.md`. In particular:

- `headline`, `project`, `date`, `summary`, and `published` are required.
- `published: false` removes an article from listings and adds `noindex`, but
  does not make its direct URL private.
- Put publish-ready article images beside `index.md` and reference them with a
  relative path. Keep source artwork in `apps/site/assets/images` when it is
  useful to retain separately.
- The optional `links` frontmatter is for prominent project destinations. It
  accepts up to four GitHub, X, or website actions.
- External links in article Markdown are given new-tab behavior and an external
  link indicator by `src/lib/hast-external-links.ts` and the global styles.

Published articles are ordered newest-first. The grouping and alternating lead
story layout are computed in `src/pages/index.astro`.

## UI conventions

The visual language is an editorial, newspaper-like layout using Cormorant
Garamond, black ink, white paper, fine rules, and restrained motion. Reuse the
tokens in `src/styles.css` and the existing Astro components before introducing
a new parallel treatment.

The site is currently Astro-only. Keep static or server-rendered work in Astro;
add a client framework integration only when a concrete interactive island
needs it.

Preserve semantic HTML, visible keyboard focus, useful image alt text, and the
existing responsive behavior when changing presentation code.

## Commands and generated files

Run commands from the repository root:

```sh
pnpm install
pnpm dev
pnpm format
pnpm lint
pnpm check
pnpm build
```

Before handing off a change, run at least `pnpm lint`, `pnpm check`, and
`pnpm build`. Dependency changes must include `pnpm-lock.yaml`.

Do not edit or commit generated output from `.astro`, `dist`, `.vercel`, or
`.turbo` directories. `apps/site/scripts/dither-image.sh` is the existing
ImageMagick pipeline for producing the site's grayscale ordered-dither images.

## Git and deployment

Use short semantic branch names such as `feat/article-links`,
`fix/mobile-layout`, or `chore/remove-presence`. Changes should reach `main`
through pull requests.

The Vercel project's Root Directory is `apps/site`.
