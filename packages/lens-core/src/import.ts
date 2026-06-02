import path from 'node:path';

import type {
  EntryStatus,
  PhotoMetadata,
  ResolvedLensConfig,
} from './types.js';
import { analyzePhoto, planDestination } from './photo.js';
import {
  addToCache,
  isDuplicate,
  loadPhotoCache,
  savePhotoCache,
  type PhotoCache,
} from './cache.js';
import { copyFile, pathExists, writeText } from './fs.js';
import { loadEntries } from './parse.js';
import { buildEntryFromPhoto, renderEntryMdx } from './mdx.js';
import { generateSlug, slugify, toIsoDate, uniqueSlug } from './slug.js';
import { formatDate } from './format.js';
import { approximateRegion, hasValidLocation } from './geo.js';

export type GroupBy = 'none' | 'date' | 'location';

export interface ImportOptions {
  /** Re-import photos even if their hash is already cached. */
  force?: boolean;
  /** Status for created entries (defaults to config.defaultStatus). */
  status?: EntryStatus;
  /** How to group photos into entries. */
  groupBy?: GroupBy;
  /** Override the title (single-photo imports only). */
  title?: string;
  /** Override the slug (single-photo imports only). */
  slug?: string;
}

export interface ImportItem {
  sourcePath: string;
  hash: string;
  status: 'imported' | 'duplicate' | 'error';
  publicPath?: string;
  destPath?: string;
  metadata?: PhotoMetadata;
  error?: string;
}

export interface CreatedEntry {
  slug: string;
  filePath: string;
  photoCount: number;
}

export interface ImportResult {
  items: ImportItem[];
  entries: CreatedEntry[];
  importedCount: number;
  duplicateCount: number;
  errorCount: number;
}

function groupKey(
  photo: PhotoMetadata,
  groupBy: GroupBy,
  index: number,
): string {
  if (groupBy === 'date') {
    return toIsoDate(photo.capturedAt ?? new Date());
  }
  if (groupBy === 'location') {
    if (photo.locationName) return slugify(photo.locationName);
    if (hasValidLocation(photo.gps)) {
      // Coarse 0.1° bucket so nearby photos group together.
      return `${photo.gps.latitude.toFixed(1)},${photo.gps.longitude.toFixed(1)}`;
    }
    return `unknown-${index}`;
  }
  // 'none' — every photo becomes its own entry.
  return `${photo.hash}-${index}`;
}

function entryTitle(
  photos: PhotoMetadata[],
  groupBy: GroupBy,
  override?: string,
): string | undefined {
  if (override) return override;
  if (groupBy === 'date' && photos[0]) {
    return formatDate(photos[0].capturedAt ?? new Date());
  }
  if (groupBy === 'location' && photos[0]?.locationName) {
    return photos[0].locationName;
  }
  return undefined;
}

/**
 * Import one or more photos into a Lens Journal project: copy files into the
 * photos directory, skip duplicates via the SHA-256 cache, then generate draft
 * MDX entries (optionally grouped by date or location).
 */
export async function importPhotos(
  cwd: string,
  config: ResolvedLensConfig,
  sources: string[],
  options: ImportOptions = {},
): Promise<ImportResult> {
  const groupBy = options.groupBy ?? 'none';
  const status = options.status ?? config.defaultStatus;

  const cache: PhotoCache = await loadPhotoCache(cwd);
  const items: ImportItem[] = [];
  const importedPhotos: PhotoMetadata[] = [];

  for (const source of sources) {
    try {
      const { hash, metadata } = await analyzePhoto(source);

      if (!options.force && isDuplicate(cache, hash)) {
        items.push({ sourcePath: source, hash, status: 'duplicate' });
        continue;
      }

      const captured = metadata.capturedAt ?? new Date();
      const filename = path.basename(source);
      const { destPath, publicPath } = planDestination(
        cwd,
        config,
        filename,
        captured,
      );

      await copyFile(source, destPath);
      metadata.filePath = destPath;
      metadata.publicPath = publicPath;

      addToCache(cache, {
        hash,
        sourcePath: source,
        publicPath,
        importedAt: new Date().toISOString(),
      });

      items.push({
        sourcePath: source,
        hash,
        status: 'imported',
        publicPath,
        destPath,
        metadata,
      });
      importedPhotos.push(metadata);
    } catch (err) {
      items.push({
        sourcePath: source,
        hash: '',
        status: 'error',
        error: (err as Error).message,
      });
    }
  }

  // Collect existing slugs so generated entries never collide.
  const { entries: existing } = await loadEntries(cwd, config);
  const usedSlugs = new Set(existing.map((e) => e.slug));

  // Group imported photos into entries.
  const groups = new Map<string, PhotoMetadata[]>();
  importedPhotos.forEach((photo, i) => {
    const key = groupKey(photo, groupBy, i);
    const list = groups.get(key) ?? [];
    list.push(photo);
    groups.set(key, list);
  });

  const created: CreatedEntry[] = [];

  for (const photos of groups.values()) {
    const cover = photos[0];
    if (!cover) continue;

    const baseEntry = buildEntryFromPhoto(cover, {
      status,
      title: entryTitle(photos, groupBy, options.title),
      slug: options.slug,
    });

    // Multi-photo group: list every photo.
    baseEntry.photos = photos.map((p) => p.publicPath);

    const desiredSlug =
      options.slug ??
      (groupBy === 'location' && cover.locationName
        ? `${toIsoDate(cover.capturedAt ?? new Date())}-${slugify(cover.locationName)}`
        : (baseEntry.slug ??
          generateSlug(
            cover.capturedAt ?? new Date(),
            path.basename(cover.publicPath),
          )));
    const slug = uniqueSlug(desiredSlug, usedSlugs);
    usedSlugs.add(slug);
    baseEntry.slug = slug;

    if (
      groupBy === 'location' &&
      !baseEntry.location?.name &&
      hasValidLocation(cover.gps)
    ) {
      baseEntry.location = { name: approximateRegion(cover.gps) };
    }

    const filePath = path.join(cwd, config.contentDir, `${slug}.mdx`);
    if (await pathExists(filePath)) {
      // Don't clobber an existing entry; record the photos in cache anyway.
      continue;
    }
    await writeText(filePath, renderEntryMdx(baseEntry));

    // Link the created slug back into the cache for each photo.
    for (const photo of photos) {
      const cached = cache.photos[photo.hash];
      if (cached) cached.slug = slug;
    }

    created.push({ slug, filePath, photoCount: photos.length });
  }

  await savePhotoCache(cwd, cache);

  return {
    items,
    entries: created,
    importedCount: items.filter((i) => i.status === 'imported').length,
    duplicateCount: items.filter((i) => i.status === 'duplicate').length,
    errorCount: items.filter((i) => i.status === 'error').length,
  };
}
