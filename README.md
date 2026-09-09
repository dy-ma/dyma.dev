# Portfolio

An Astro site deployed as a Cloudflare Worker. Pages and articles are
prerendered; the visitor counter is a React island backed by a Durable Object.

```sh
npm install
npm run dev
```

Useful checks:

```sh
npm run lint
npm run check
npm run build
npm start
```

`npm run deploy` builds and deploys the production Worker. For a preview
version, build first and then run `npx wrangler versions upload`.

Articles live in `content/articles/<slug>/index.md`. See
`content/README.md` for the frontmatter schema.
