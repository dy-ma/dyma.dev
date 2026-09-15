# dyma.dev

`dyma.dev` is an Astro site deployed on Vercel. The application lives in
`apps/site` within a small pnpm workspace.

## Local development

```sh
pnpm install
pnpm dev
```

That command starts Astro on `http://localhost:3000`.

Useful checks:

```sh
pnpm lint
pnpm check
pnpm build
```

Articles live in `apps/site/content/articles/<slug>/index.md`. See
`apps/site/content/README.md` for the frontmatter schema.

## Vercel

Create the project with **Root Directory** set to `apps/site`. No environment
variables are currently required.
