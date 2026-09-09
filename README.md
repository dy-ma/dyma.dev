# dyma.dev

`dyma.dev` is a pnpm workspace with two independently deployed apps:

- `apps/site` is the Astro frontend deployed on Vercel.
- `apps/presence` is the Cloudflare Worker named `dyma-presence`, which owns the
  visitor-counter Durable Object.

The site calls its own `/api/visitor` route. In production that route forwards
to the presence Worker, so the browser never needs the Worker secret or a
cross-origin request.

## Local development

```sh
pnpm install
pnpm dev
```

That one command starts Astro on `http://localhost:3000` and Wrangler's local
Worker/Durable Object emulator on `http://localhost:8787`.

Useful checks:

```sh
pnpm lint
pnpm check
pnpm build
```

Articles live in `apps/site/content/articles/<slug>/index.md`. See
`apps/site/content/README.md` for the frontmatter schema.

## Vercel

Create the frontend project with **Root Directory** set to `apps/site` and keep
Vercel's **Skip deployments when there are no changes to the root directory**
setting enabled. Vercel will then create its normal PR preview and deployment
comment for frontend changes, while a Worker-only change is skipped.

Set these variables for the Production environment:

- `VISITOR_API_URL`: the deployed Cloudflare Worker origin
- `VISITOR_API_SECRET`: the same secret stored on the Worker
- `VISITOR_COOKIE_SECRET`: a separate random signing secret

Preview deployments intentionally return stable sample visitor data. They do
not contact or increment the production Durable Object.

## Cloudflare

Create the backend Worker as `dyma-presence`. Set its secret once:

```sh
pnpm --filter @dyma/presence exec wrangler secret put VISITOR_API_SECRET
```

The visitor count is disposable. There is no application-level data migration
or compatibility layer for existing Durable Object records.

Deploy it with:

```sh
pnpm deploy:presence
```

For Workers Builds, set **Root directory** to `apps/presence` and use
`pnpm deploy` as the production deploy command. Leave the non-production deploy
command as `pnpm exec wrangler versions upload`; it uploads a testable Worker
version without moving production traffic. Configure these repository-relative
Build Watch Paths:

```text
apps/presence/*
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
turbo.json
```

That keeps article and site-only changes from deploying the Worker while still
rebuilding it when workspace-level dependency or task configuration changes.
