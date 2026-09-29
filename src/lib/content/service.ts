import { getCollection } from 'astro:content';
import { readingPaths, pathsFor, relatedFromPaths } from '../../config/reading-paths';
import { articleSymbols } from '../../config/article-symbols';
import { articleLabs } from '../../features/physics-lab/registry';
import { createContentIndex } from './references';
import type { ArticleEntry } from '../content';

export async function getPublicContent() {
  return createContentIndex(await getCollection('articles'), readingPaths, Object.keys(articleSymbols), Object.keys(articleLabs));
}
export async function articlePaths(type: 'essay' | 'note') {
  const { entries } = await getPublicContent();
  return entries.filter(post => post.data.type === type).map(post => ({ params: { id: post.id }, props: { post } }));
}
export async function articleContext(post: ArticleEntry) {
  const content = await getPublicContent();
  return {
    relatedEntries: [...new Set([...post.data.related, ...relatedFromPaths(post.id)])].map(id => content.requireEntry(id, post.id)),
    backlinkEntries: post.data.backlinks.map(id => content.requireEntry(id, post.id)),
  };
}
export async function readingRoutes(id?: string) {
  const content = await getPublicContent();
  return (id ? pathsFor(id) : readingPaths).map(route => ({
    ...route,
    steps: route.steps.map(step => ({ ...step, entry: content.requireEntry(step.id, route.id) })),
  }));
}
