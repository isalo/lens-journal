import type { ImageMetadata } from 'astro';
import type { CollectionEntry } from 'astro:content';

/** Raw entry as stored in the `entries` content collection. */
export type JournalEntry = CollectionEntry<'entries'>;

/** Frontmatter schema, inferred from the content collection definition. */
export type EntryData = JournalEntry['data'];

/** Geographic coordinate extracted from EXIF GPS data. */
export interface GeoPoint {
  latitude: number;
  longitude: number;
  /** Optional altitude in meters. */
  altitude?: number;
}

/**
 * Normalized EXIF metadata. Every field is optional because real-world
 * photographs frequently omit data (or strip it for privacy).
 */
export interface PhotoExif {
  make?: string;
  model?: string;
  /** Human friendly camera label, e.g. "FUJIFILM X-T5". */
  camera?: string;
  lens?: string;
  /** Focal length in millimeters. */
  focalLength?: number;
  /** 35mm-equivalent focal length, when available. */
  focalLength35mm?: number;
  /** Aperture f-number, e.g. 2.8. */
  aperture?: number;
  /** Shutter speed in seconds (e.g. 0.005 -> "1/200"). */
  shutterSpeed?: number;
  iso?: number;
  /** Original capture date, parsed from EXIF DateTimeOriginal. */
  capturedAt?: Date;
  width?: number;
  height?: number;
  orientation?: number;
  gps?: GeoPoint;
}

/**
 * A fully resolved photograph: the optimized image (Sharp/Astro) plus the
 * extracted EXIF metadata. This is the primary unit the UI renders.
 */
export interface Photo {
  /** File name within the photos directory, e.g. "warsaw.jpg". */
  filename: string;
  /** Optimized image metadata for use with Astro's <Image /> component. */
  image: ImageMetadata;
  exif: PhotoExif;
}

/** A journal entry joined with its resolved hero photo. */
export interface ResolvedEntry {
  entry: JournalEntry;
  slug: string;
  photo: Photo | null;
}

/** Aggregate grouping used by the camera and lens index pages. */
export interface GearGroup {
  /** URL-safe identifier. */
  slug: string;
  /** Display label, e.g. "FUJIFILM X-T5". */
  label: string;
  entries: ResolvedEntry[];
  count: number;
}

/** A single point rendered on the world map. */
export interface MapMarker {
  slug: string;
  title: string;
  lat: number;
  lng: number;
  href: string;
  thumbnail?: string;
  location?: string;
}
