import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

import { SITE } from './src/consts.ts';

// https://astro.build
// `base` and `site` can be overridden at build time (e.g. for GitHub Pages
// project sites served under /<repo>/) without touching the source.
export default defineConfig({
  site: process.env.SITE_URL || SITE.url,
  base: process.env.BASE_PATH || '/',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [mdx(), sitemap(), tailwind({ applyBaseStyles: false })],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
  image: {
    // Sharp is the default image service; tune defaults here.
    responsiveStyles: true,
  },
});
