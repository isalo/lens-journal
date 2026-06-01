import { stringify as stringifyYaml } from 'yaml';

import type {
  EntryStatus,
  JournalEntryInput,
  PhotoMetadata,
} from './types.js';
import { generateSlug, toIsoDate } from './slug.js';
import { buildCameraLabel } from './exif.js';
import { formatAperture, formatFocalLength, formatShutter } from './format.js';

export interface BuildEntryOptions {
  /** Default status for the new entry. */
  status?: EntryStatus;
  /** Override the generated slug. */
  slug?: string;
  /** Override the generated title. */
  title?: string;
  /** Body content (defaults to a writing prompt). */
  body?: string;
}

const DEFAULT_BODY = 'Write the story here…\n';

/** Title-case a slug-ish base name, e.g. "morning-in-warsaw" -> "Morning In Warsaw". */
function titleFromFilename(filename: string): string {
  const base = filename
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .trim();
  return base
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Build a {@link JournalEntryInput} (the on-disk frontmatter shape) from a
 * processed photo's metadata.
 */
export function buildEntryFromPhoto(
  photo: PhotoMetadata,
  options: BuildEntryOptions = {},
): JournalEntryInput {
  const date = photo.capturedAt ?? new Date();
  const filename = photo.publicPath.split('/').pop() ?? 'photo';
  const slug = options.slug ?? generateSlug(date, filename);
  const title = options.title ?? titleFromFilename(filename);

  const cameraLabel = buildCameraLabel(photo.cameraMake, photo.cameraModel);

  return {
    title,
    slug,
    date: toIsoDate(date),
    status: options.status ?? 'draft',
    coverPhoto: photo.publicPath,
    photos: [photo.publicPath],
    tags: [],
    camera:
      photo.cameraMake || photo.cameraModel
        ? { make: photo.cameraMake, model: photo.cameraModel }
        : undefined,
    lens: photo.lensModel ? { model: photo.lensModel } : undefined,
    exif: {
      focalLength: formatFocalLength(photo.focalLength),
      aperture: formatAperture(photo.aperture),
      shutterSpeed: formatShutter(photo.shutterSpeed),
      iso: photo.iso,
    },
    gps: photo.gps,
    location: photo.locationName ? { name: photo.locationName } : undefined,
    _cameraLabel: cameraLabel,
  } as JournalEntryInput & { _cameraLabel?: string };
}

/** Recursively drop `undefined` values so they never reach the YAML output. */
function prune<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => prune(v)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue;
      if (k.startsWith('_')) continue;
      const pruned = prune(v);
      if (
        pruned &&
        typeof pruned === 'object' &&
        !Array.isArray(pruned) &&
        Object.keys(pruned).length === 0
      ) {
        continue;
      }
      out[k] = pruned;
    }
    return out as T;
  }
  return value;
}

/**
 * Serialize an entry into a complete MDX document string (YAML frontmatter +
 * body). Empty/undefined fields are omitted for clean output.
 */
export function renderEntryMdx(
  entry: JournalEntryInput,
  body: string = DEFAULT_BODY,
): string {
  const frontmatter = prune(entry);
  const yaml = stringifyYaml(frontmatter, { lineWidth: 0 }).trimEnd();
  return `---\n${yaml}\n---\n\n${body.endsWith('\n') ? body : `${body}\n`}`;
}
