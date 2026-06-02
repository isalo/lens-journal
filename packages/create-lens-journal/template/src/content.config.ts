import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { journalEntrySchema } from '@lens-journal/core';

/**
 * The `journal` collection. Entries are MDX files under `src/content/journal`
 * that the `lens` CLI generates from your photos. They are validated against
 * the same Zod schema the CLI writes, so frontmatter never drifts.
 */
const journal = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/journal' }),
  schema: journalEntrySchema,
});

export const collections = { journal };
