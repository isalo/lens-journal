import { z } from 'zod';

/**
 * Supported source image extensions (lowercase, without the leading dot).
 * Used by the importer and validator.
 */
export const SUPPORTED_IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'avif',
  'tif',
  'tiff',
  'heic',
  'heif',
] as const;

export type SupportedImageExtension =
  (typeof SUPPORTED_IMAGE_EXTENSIONS)[number];

export const ENTRY_STATUSES = ['draft', 'published'] as const;
export type EntryStatus = (typeof ENTRY_STATUSES)[number];

export const MAP_PROVIDERS = ['maplibre', 'none'] as const;
export type MapProvider = (typeof MAP_PROVIDERS)[number];

/* -------------------------------------------------------------------------- */
/* GPS                                                                        */
/* -------------------------------------------------------------------------- */

export const gpsSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  altitude: z.number().optional(),
});

export type GPS = z.infer<typeof gpsSchema>;

/* -------------------------------------------------------------------------- */
/* Photo metadata (produced by the EXIF + hashing pipeline)                   */
/* -------------------------------------------------------------------------- */

export interface PhotoMetadata {
  /** Absolute or project-relative path to the original file on disk. */
  filePath: string;
  /** Web path the site will serve the photo from, e.g. "/photos/2026/06/img.jpg". */
  publicPath: string;
  /** SHA-256 hash of the file contents, used for duplicate detection. */
  hash: string;
  /** Pixel width, from Sharp. */
  width?: number;
  /** Pixel height, from Sharp. */
  height?: number;
  /** Original capture timestamp from EXIF (DateTimeOriginal / CreateDate). */
  capturedAt?: Date;
  cameraMake?: string;
  cameraModel?: string;
  lensModel?: string;
  /** Focal length in millimeters. */
  focalLength?: number;
  /** 35mm-equivalent focal length, when present. */
  focalLength35mm?: number;
  /** Aperture f-number, e.g. 2.8. */
  aperture?: number;
  /** Shutter speed in seconds (e.g. 0.005). */
  shutterSpeed?: number;
  iso?: number;
  gps?: GPS;
  /** Human readable place name (only set if reverse geocoding is enabled). */
  locationName?: string;
}

/* -------------------------------------------------------------------------- */
/* Journal entry frontmatter                                                  */
/* -------------------------------------------------------------------------- */

export const cameraSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
});

export const lensSchema = z.object({
  model: z.string().optional(),
});

export const entryExifSchema = z.object({
  focalLength: z.string().optional(),
  aperture: z.string().optional(),
  shutterSpeed: z.string().optional(),
  iso: z.number().optional(),
});

export const locationSchema = z.object({
  name: z.string().optional(),
});

/**
 * The canonical journal-entry frontmatter schema. The Astro content collection
 * and the CLI validator both consume this so the website and tooling can never
 * disagree about the shape of an entry.
 */
export const journalEntrySchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).optional(),
  date: z.coerce.date(),
  status: z.enum(ENTRY_STATUSES).default('draft'),
  coverPhoto: z.string().optional(),
  photos: z.array(z.string()).default([]),
  excerpt: z.string().optional(),
  tags: z.array(z.string()).default([]),
  camera: cameraSchema.optional(),
  lens: lensSchema.optional(),
  exif: entryExifSchema.optional(),
  gps: gpsSchema.optional(),
  location: locationSchema.optional(),
});

export type JournalEntryFrontmatter = z.infer<typeof journalEntrySchema>;

/** Frontmatter as written to disk (dates serialized as YYYY-MM-DD strings). */
export interface JournalEntryInput {
  title: string;
  slug: string;
  date: string;
  status: EntryStatus;
  coverPhoto?: string;
  photos: string[];
  excerpt?: string;
  tags: string[];
  camera?: { make?: string; model?: string };
  lens?: { model?: string };
  exif?: {
    focalLength?: string;
    aperture?: string;
    shutterSpeed?: string;
    iso?: number;
  };
  gps?: GPS;
  location?: { name?: string };
}

/** A parsed entry on disk: its frontmatter plus the markdown body + path. */
export interface JournalEntry {
  filePath: string;
  slug: string;
  frontmatter: JournalEntryFrontmatter;
  body: string;
}

/* -------------------------------------------------------------------------- */
/* Config                                                                     */
/* -------------------------------------------------------------------------- */

export const lensConfigSchema = z.object({
  contentDir: z.string().default('src/content/journal'),
  photosDir: z.string().default('public/photos'),
  outputDir: z.string().default('dist'),
  timezone: z.string().default('UTC'),
  defaultStatus: z.enum(ENTRY_STATUSES).default('draft'),
  mapProvider: z.enum(MAP_PROVIDERS).default('maplibre'),
  imageQuality: z.number().min(1).max(100).default(85),
  generateResponsiveImages: z.boolean().default(true),
});

/** User-facing config — every field optional (defaults are applied). */
export type LensConfig = Partial<z.input<typeof lensConfigSchema>>;

/** Config after defaults are applied. */
export type ResolvedLensConfig = z.infer<typeof lensConfigSchema>;

/* -------------------------------------------------------------------------- */
/* Validation diagnostics                                                     */
/* -------------------------------------------------------------------------- */

export type DiagnosticLevel = 'error' | 'warning';

export interface Diagnostic {
  level: DiagnosticLevel;
  code: string;
  message: string;
  /** Entry slug or file the diagnostic relates to, when applicable. */
  source?: string;
}
