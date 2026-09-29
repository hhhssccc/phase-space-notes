import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content' }),
  schema: z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    abstract: z.string().optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    type: z.enum(['essay', 'note']).default('essay'),
    category: z.string().trim().min(1),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean(),
    related: z.array(z.string()).default([]),
    backlinks: z.array(z.string()).default([]),
    mathDisplay: z.enum(['auto', 'ruled', 'plain']).default('auto'),
    sidenotes: z.array(z.object({
      marker: z.string(),
      title: z.string().trim().min(1),
      body: z.string(),
    })).default([]),
  }).refine(data => !data.updated || data.updated >= data.date, { message: 'updated must not precede date', path: ['updated'] })
    .refine(data => data.type !== 'note' || !data.featured, { message: 'Only essays may be featured', path: ['featured'] }),
});

export const collections = { articles };
