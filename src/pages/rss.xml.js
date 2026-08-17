import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { byNewest, entryUrl } from '../lib/content';
import { siteConfig } from '../config/site';

export async function GET(context) {
  const entries = (await getCollection('articles', ({ data }) => !data.draft)).sort(byNewest);
  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site,
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: entryUrl(entry),
      categories: entry.data.tags,
      content: entry.body,
    })),
    customData: '<language>zh-CN</language>',
  });
}
