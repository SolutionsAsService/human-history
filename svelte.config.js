import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
// BASE_PATH is set by the Pages workflow (/human-history); locally the site is served from the root.
export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({ pages: 'dist', assets: 'dist', fallback: undefined, strict: true }),
    paths: { base: process.env.BASE_PATH ?? '' },
    alias: { '#data': 'src/data/index.ts', '#data/*': 'src/data/*' },
    prerender: { handleHttpError: 'warn' },
  },
};
