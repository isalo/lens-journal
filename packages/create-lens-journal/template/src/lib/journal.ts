import { getCollection } from 'astro:content';
import {
  byNewest,
  cameraLabel,
  entryCoords,
  lensLabel,
  locationLabel,
  slugify,
} from '@lens-journal/theme';

import type { Entry, GalleryPhoto, GearGroup, MapMarker } from '@types';

const isProd = import.meta.env.PROD;

/** The canonical slug for an entry (frontmatter slug wins over file id). */
export function slugOf(entry: Entry): string {
  return entry.data.slug ?? entry.id;
}

/** The permalink for an entry. */
export function hrefOf(entry: Entry): string {
  return `/entries/${slugOf(entry)}`;
}

/**
 * All entries, newest first. Drafts are hidden in production builds but shown
 * during local development so you can preview them.
 */
export async function getEntries(): Promise<Entry[]> {
  const entries = await getCollection('journal', ({ data }) =>
    isProd ? data.status === 'published' : true,
  );
  return entries.sort((a, b) => byNewest(a.data, b.data));
}

/** Flatten every photo across all entries for the gallery grid. */
export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  const entries = await getEntries();
  const photos: GalleryPhoto[] = [];
  for (const entry of entries) {
    const slug = slugOf(entry);
    const sources =
      entry.data.photos.length > 0
        ? entry.data.photos
        : entry.data.coverPhoto
          ? [entry.data.coverPhoto]
          : [];
    for (const src of sources) {
      photos.push({ src, slug, title: entry.data.title });
    }
  }
  return photos;
}

/** Build the marker set for the world map from entries with valid GPS. */
export async function getMapMarkers(): Promise<MapMarker[]> {
  const entries = await getEntries();
  const markers: MapMarker[] = [];
  for (const entry of entries) {
    const coords = entryCoords(entry.data);
    if (!coords) continue;
    markers.push({
      slug: slugOf(entry),
      title: entry.data.title,
      lat: coords.latitude,
      lng: coords.longitude,
      href: hrefOf(entry),
      thumbnail: entry.data.coverPhoto,
      location: locationLabel(entry.data),
    });
  }
  return markers;
}

function groupByGear(
  entries: Entry[],
  keyer: (entry: Entry) => string | undefined,
): GearGroup[] {
  const groups = new Map<string, GearGroup>();
  for (const entry of entries) {
    const label = keyer(entry);
    if (!label) continue;
    const slug = slugify(label);
    const existing = groups.get(slug);
    if (existing) {
      existing.entries.push(entry);
      existing.count += 1;
    } else {
      groups.set(slug, { slug, label, entries: [entry], count: 1 });
    }
  }
  return [...groups.values()].sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label),
  );
}

/** Entries grouped by camera model. */
export async function getCameraGroups(): Promise<GearGroup[]> {
  return groupByGear(await getEntries(), (e) => cameraLabel(e.data));
}

/** Entries grouped by lens. */
export async function getLensGroups(): Promise<GearGroup[]> {
  return groupByGear(await getEntries(), (e) => lensLabel(e.data));
}

export { cameraLabel, lensLabel, locationLabel, entryCoords, slugify };
