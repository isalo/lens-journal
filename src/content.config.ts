import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * The `entries` collection holds every journal post.
 *
 * Each entry is a folder under `src/content/entries/<slug>/index.mdx`.
 * Photographs are referenced by file name and resolved at build time from
 * `src/assets/photos` (see `src/lib/photos.ts`), which lets us extract EXIF
 * from the originals while still serving Sharp-optimized images.
 */
const entries = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/entries' }),
  schema: z.object({
    title: z.string(),
    /** ISO date — used for the timeline ordering and RSS. */
    date: z.coerce.date(),
    /** Hero photograph file name within src/assets/photos (e.g. "warsaw.jpg"). */
    photo: z.string().optional(),
    /** Additional photographs for the entry gallery. */
    gallery: z.array(z.string()).default([]),
    summary: z.string().optional(),
    tags: z.array(z.string()).default([]),
    /**
     * Human-readable place name. When omitted, the map falls back to GPS
     * coordinates extracted from EXIF. Set this for privacy or nicer labels.
     */
    location: z.string().optional(),
    /** Manually override GPS (e.g. when the photo has no embedded location). */
    coordinates: z
      .object({ lat: z.number(), lng: z.number() })
      .optional(),
    /** Hide an entry from listings while keeping its page reachable. */
    draft: z.boolean().default(false),
    /** Override the auto-detected camera/lens labels if needed. */
    camera: z.string().optional(),
    lens: z.string().optional(),
  }),
});

export const collections = { entries };
