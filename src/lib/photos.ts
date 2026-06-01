import type { ImageMetadata } from 'astro';

import type { Photo } from '@types';
import { getPhotoExif } from '@lib/exif';

/**
 * Eagerly import every photograph so Astro/Sharp can optimize them and so we
 * can resolve `ImageMetadata` by file name. Originals live in
 * `src/assets/photos` and are referenced from MDX frontmatter by file name.
 */
const modules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/photos/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  { eager: true },
);

/** Map of "filename.jpg" -> optimized ImageMetadata. */
const imageByFilename = new Map<string, ImageMetadata>();
for (const [filepath, mod] of Object.entries(modules)) {
  const filename = filepath.split('/').pop();
  if (filename) imageByFilename.set(filename, mod.default);
}

/** Build-time cache of fully-resolved photos (image + EXIF). */
const photoCache = new Map<string, Promise<Photo | null>>();

/** All known photo file names (sorted). */
export function listPhotoFilenames(): string[] {
  return [...imageByFilename.keys()].sort();
}

/** Resolve a single photograph (optimized image + normalized EXIF). */
export function getPhoto(filename?: string | null): Promise<Photo | null> {
  if (!filename) return Promise.resolve(null);

  const cached = photoCache.get(filename);
  if (cached) return cached;

  const task = (async (): Promise<Photo | null> => {
    const image = imageByFilename.get(filename);
    if (!image) {
      console.warn(
        `[lens-journal] Photo "${filename}" not found in src/assets/photos`,
      );
      return null;
    }
    const exif = await getPhotoExif(filename);
    return { filename, image, exif };
  })();

  photoCache.set(filename, task);
  return task;
}

/** Resolve many photographs, skipping any that cannot be found. */
export async function getPhotos(filenames: string[]): Promise<Photo[]> {
  const resolved = await Promise.all(filenames.map((f) => getPhoto(f)));
  return resolved.filter((p): p is Photo => p !== null);
}
