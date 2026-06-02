import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

import { SITE } from './src/consts.ts';

// https://astro.build
export default defineConfig({
  site: SITE.url,
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
