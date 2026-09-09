import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const articles = defineCollection({
  loader: glob({
    base: './content/articles',
    pattern: '*/index.md',
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      headline: z.string().min(1),
      project: z.string().min(1),
      date: z.coerce.date().optional(),
      summary: z.string().min(1),
      published: z.boolean(),
      home: z.enum(['lead', 'secondary', 'none']).default('none'),
      homeOrder: z.number().optional(),
      homeTreatment: z.enum(['full', 'excerpt']).default('excerpt'),
      image: image().optional(),
      imageAlt: z.string().optional(),
      imageCaption: z.string().optional(),
    }),
});

export const collections = { articles };
