import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    abstract: z.string().optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    type: z.enum(['essay', 'note']).default('essay'),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    related: z.array(z.string()).default([]),
    backlinks: z.array(z.string()).default([]),
    sidenotes: z.array(z.object({
      marker: z.string(),
      title: z.string(),
      body: z.string(),
    })).default([]),
  }),
});

export const collections = { articles };
