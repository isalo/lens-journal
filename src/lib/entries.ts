import { getCollection } from 'astro:content';

import type {
  GearGroup,
  JournalEntry,
  MapMarker,
  Photo,
  ResolvedEntry,
} from '@types';
import { getPhoto } from '@lib/photos';
import { slugify, hasValidLocation } from '@lib/geo';

const isProd = import.meta.env.PROD;

/** All published entries, newest first. Drafts are hidden in production. */
export async function getEntries(): Promise<JournalEntry[]> {
  const entries = await getCollection('entries', ({ data }) =>
    isProd ? data.draft !== true : true,
  );
  return entries.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
}

/** Join an entry with its resolved hero photo. */
export async function resolveEntry(entry: JournalEntry): Promise<ResolvedEntry> {
  const photo = await getPhoto(entry.data.photo);
  return { entry, slug: entry.id, photo };
}

/** All entries resolved with their hero photos, newest first. */
export async function getResolvedEntries(): Promise<ResolvedEntry[]> {
  const entries = await getEntries();
  return Promise.all(entries.map(resolveEntry));
}

/** The effective camera label for an entry (frontmatter override wins). */
export function cameraOf(resolved: ResolvedEntry): string | undefined {
  return resolved.entry.data.camera ?? resolved.photo?.exif.camera;
}

/** The effective lens label for an entry (frontmatter override wins). */
export function lensOf(resolved: ResolvedEntry): string | undefined {
  return resolved.entry.data.lens ?? resolved.photo?.exif.lens;
}

/** The effective coordinates for an entry (frontmatter override wins). */
export function coordsOf(
  resolved: ResolvedEntry,
): { lat: number; lng: number } | undefined {
  const manual = resolved.entry.data.coordinates;
  if (manual) return manual;
  const gps = resolved.photo?.exif.gps;
  if (hasValidLocation(gps)) {
    return { lat: gps.latitude, lng: gps.longitude };
  }
  return undefined;
}

/** Group resolved entries by a derived key (camera/lens), sorted by count. */
function groupBy(
  entries: ResolvedEntry[],
  keyer: (e: ResolvedEntry) => string | undefined,
): GearGroup[] {
  const groups = new Map<string, GearGroup>();
  for (const resolved of entries) {
    const label = keyer(resolved);
    if (!label) continue;
    const slug = slugify(label);
    const existing = groups.get(slug);
    if (existing) {
      existing.entries.push(resolved);
      existing.count += 1;
    } else {
      groups.set(slug, { slug, label, entries: [resolved], count: 1 });
    }
  }
  return [...groups.values()].sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label),
  );
}

/** Entries grouped by camera model. */
export async function getCameraGroups(): Promise<GearGroup[]> {
  return groupBy(await getResolvedEntries(), cameraOf);
}

/** Entries grouped by lens. */
export async function getLensGroups(): Promise<GearGroup[]> {
  return groupBy(await getResolvedEntries(), lensOf);
}

/** Flatten all photographs across entries for the gallery grid. */
export async function getGalleryPhotos(): Promise<
  { photo: Photo; slug: string; title: string }[]
> {
  const resolved = await getResolvedEntries();
  const out: { photo: Photo; slug: string; title: string }[] = [];
  for (const r of resolved) {
    if (r.photo) {
      out.push({ photo: r.photo, slug: r.slug, title: r.entry.data.title });
    }
  }
  return out;
}

/** Build the marker set for the world map page. */
export async function getMapMarkers(): Promise<MapMarker[]> {
  const resolved = await getResolvedEntries();
  const markers: MapMarker[] = [];
  for (const r of resolved) {
    const coords = coordsOf(r);
    if (!coords) continue;
    markers.push({
      slug: r.slug,
      title: r.entry.data.title,
      lat: coords.lat,
      lng: coords.lng,
      href: `/entries/${r.slug}`,
      thumbnail: r.photo?.image.src,
      location: r.entry.data.location,
    });
  }
  return markers;
}
