import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { byNewest, entryUrl } from '../lib/content';
import { siteConfig } from '../config/site';

export async function GET(context) {
  const entries = (await getCollection('articles', ({ data }) => !data.draft)).sort(byNewest);
  const siteRoot = new URL(import.meta.env.BASE_URL || '/', context.site);
  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: siteRoot,
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: new URL(entryUrl(entry), context.site).href,
    })),
    customData: '<language>zh-CN</language>',
  });
}
