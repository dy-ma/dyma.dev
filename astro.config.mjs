import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === 'seatbelt';
process.env.WRANGLER_WRITE_LOGS ??= 'false';
process.env.WRANGLER_LOG_PATH ??= '.wrangler/logs';
process.env.MINIFLARE_REGISTRY_PATH ??= '.wrangler/registry';

const { default: cloudflare } = await import('@astrojs/cloudflare');

export default defineConfig({
  output: 'server',
  adapter: cloudflare({ imageService: 'compile' }),
  integrations: [react()],
  session: false,
  vite: {
    plugins: [tailwindcss()],
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
  },
});
