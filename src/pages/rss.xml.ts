import rss from '@astrojs/rss';
import type { APIContext } from 'astro';

import { SITE } from '@/consts';
import { getEntries } from '@lib/entries';

export async function GET(context: APIContext) {
  const entries = await getEntries();
  const site = context.site ?? SITE.url;

  return rss({
    title: SITE.title,
    description: SITE.description,
    site,
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.summary ?? '',
      pubDate: entry.data.date,
      link: `/entries/${entry.id}`,
      categories: entry.data.tags,
    })),
    customData: `<language>${SITE.locale}</language>`,
  });
}
