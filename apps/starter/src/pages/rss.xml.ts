import rss from '@astrojs/rss';
import type { APIContext } from 'astro';

import { SITE } from '@/consts';
import { getEntries, hrefOf } from '@lib/journal';

export async function GET(context: APIContext) {
  const entries = await getEntries();
  const site = context.site ?? SITE.url;

  return rss({
    title: SITE.title,
    description: SITE.description,
    site,
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.excerpt ?? '',
      pubDate: entry.data.date,
      link: hrefOf(entry),
      categories: entry.data.tags,
    })),
    customData: `<language>${SITE.locale}</language>`,
  });
}
