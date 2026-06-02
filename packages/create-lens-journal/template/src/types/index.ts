import type { CollectionEntry } from 'astro:content';

export type {
  JournalEntryFrontmatter,
  GPS,
  EntryStatus,
} from '@lens-journal/core';

/** A single journal entry from the content collection. */
export type Entry = CollectionEntry<'journal'>;

/** A pin on the world map. */
export interface MapMarker {
  slug: string;
  title: string;
  lat: number;
  lng: number;
  href: string;
  thumbnail?: string;
  location?: string;
}

/** A photo reference for the gallery grid. */
export interface GalleryPhoto {
  src: string;
  slug: string;
  title: string;
}

/** Entries grouped by a piece of gear (camera or lens). */
export interface GearGroup {
  slug: string;
  label: string;
  entries: Entry[];
  count: number;
}
