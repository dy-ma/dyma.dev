# Portfolio

An Astro site deployed as a Cloudflare Worker. Pages and articles are
prerendered; the visitor counter is a React island backed by a Durable Object.

```sh
pnpm install
pnpm dev
```

Useful checks:

```sh
pnpm lint
pnpm check
pnpm build
pnpm start
```

`pnpm deploy` builds and deploys the production Worker. For an unpromoted
version, build first and then run `pnpm exec wrangler versions upload`.

Articles live in `content/articles/<slug>/index.md`. See
`content/README.md` for the frontmatter schema.
