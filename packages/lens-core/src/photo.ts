import fs from 'node:fs/promises';
import path from 'node:path';

import type { PhotoMetadata, ResolvedLensConfig } from './types.js';
import { hashBuffer } from './hash.js';
import { extractExifFromBuffer } from './exif.js';
import { getImageSize } from './image.js';

/**
 * Derive the web path a photo will be served from, given the project's
 * `photosDir`. If `photosDir` lives under `public/`, that prefix is stripped
 * (Astro/most static hosts serve `public/` from the site root); otherwise the
 * path is rooted at `/photos`.
 */
export function toPublicPath(
  config: Pick<ResolvedLensConfig, 'photosDir'>,
  relativeFromPhotosDir: string,
): string {
  const normalized = config.photosDir.replace(/\\/g, '/').replace(/\/$/, '');
  const rel = relativeFromPhotosDir.replace(/\\/g, '/').replace(/^\//, '');
  if (normalized.startsWith('public/')) {
    const base = normalized.slice('public/'.length);
    return `/${[base, rel].filter(Boolean).join('/')}`;
  }
  if (normalized === 'public') {
    return `/${rel}`;
  }
  return `/photos/${rel}`;
}

/**
 * Compute the destination (on disk + public) for an imported photo, organized
 * into `<photosDir>/<YYYY>/<MM>/<filename>` based on its capture date.
 */
export function planDestination(
  cwd: string,
  config: ResolvedLensConfig,
  filename: string,
  capturedAt: Date,
): { destPath: string; publicPath: string; relative: string } {
  const year = String(capturedAt.getUTCFullYear());
  const month = String(capturedAt.getUTCMonth() + 1).padStart(2, '0');
  const relative = `${year}/${month}/${filename}`;
  const destPath = path.join(cwd, config.photosDir, year, month, filename);
  const publicPath = toPublicPath(config, relative);
  return { destPath, publicPath, relative };
}

export interface AnalyzedPhoto {
  hash: string;
  metadata: PhotoMetadata;
}

/**
 * Read a photo once and produce its full {@link PhotoMetadata}: SHA-256 hash,
 * normalized EXIF and pixel dimensions. `publicPath` is provisional and should
 * be finalized by the importer once the destination is known.
 */
export async function analyzePhoto(filePath: string): Promise<AnalyzedPhoto> {
  const buffer = await fs.readFile(filePath);
  const hash = hashBuffer(buffer);
  const exif = await extractExifFromBuffer(buffer);
  const size = await getImageSize(filePath);

  const metadata: PhotoMetadata = {
    filePath,
    publicPath: '',
    hash,
    width: exif.width ?? size.width,
    height: exif.height ?? size.height,
    capturedAt: exif.capturedAt,
    cameraMake: exif.cameraMake,
    cameraModel: exif.cameraModel,
    lensModel: exif.lensModel,
    focalLength: exif.focalLength,
    focalLength35mm: exif.focalLength35mm,
    aperture: exif.aperture,
    shutterSpeed: exif.shutterSpeed,
    iso: exif.iso,
    gps: exif.gps,
  };

  return { hash, metadata };
}
