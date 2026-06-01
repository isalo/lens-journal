import path from 'node:path';

import { readJson, writeJson } from './fs.js';

/** Relative location of the dedupe cache within a project. */
export const CACHE_DIR = '.lens/cache';
export const CACHE_FILE = 'photos.json';

export interface CachedPhoto {
  hash: string;
  /** Original source path the photo was imported from. */
  sourcePath: string;
  /** Public path the photo is served from. */
  publicPath: string;
  /** Slug of the entry the photo was attached to. */
  slug?: string;
  /** ISO timestamp of when the photo was imported. */
  importedAt: string;
}

export interface PhotoCache {
  version: 1;
  /** Map of SHA-256 hash -> cached photo record. */
  photos: Record<string, CachedPhoto>;
}

function emptyCache(): PhotoCache {
  return { version: 1, photos: {} };
}

function cachePath(cwd: string): string {
  return path.join(cwd, CACHE_DIR, CACHE_FILE);
}

/** Load the photo dedupe cache for a project (empty cache if none exists). */
export async function loadPhotoCache(cwd: string): Promise<PhotoCache> {
  const data = await readJson<PhotoCache>(cachePath(cwd), emptyCache());
  if (!data || data.version !== 1 || typeof data.photos !== 'object') {
    return emptyCache();
  }
  return data;
}

/** Persist the photo dedupe cache for a project. */
export async function savePhotoCache(
  cwd: string,
  cache: PhotoCache,
): Promise<void> {
  await writeJson(cachePath(cwd), cache);
}

/** True when a hash has already been imported. */
export function isDuplicate(cache: PhotoCache, hash: string): boolean {
  return Boolean(cache.photos[hash]);
}

/** Add or replace a cache record (mutates and returns the cache). */
export function addToCache(
  cache: PhotoCache,
  record: CachedPhoto,
): PhotoCache {
  cache.photos[record.hash] = record;
  return cache;
}
