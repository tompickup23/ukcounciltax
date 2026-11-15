import { defineConfig } from 'astro/config';
import main from './astro.config.mjs';

// A separate source tree and output directory. The normal build has no pilot routes.
export default defineConfig({
  ...main,
  srcDir: './pilot',
  outDir: './.ops/c2-dist',
  cacheDir: './.ops/c2-cache',
});
