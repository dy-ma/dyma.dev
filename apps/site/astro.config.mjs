import { satteri } from '@astrojs/markdown-satteri';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { hastExternalLinks } from './src/lib/hast-external-links';

const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === 'seatbelt';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  markdown: {
    processor: satteri({
      hastPlugins: [hastExternalLinks],
    }),
  },
  session: false,
  vite: {
    plugins: [tailwindcss()],
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
  },
});
