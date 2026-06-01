import fs from 'node:fs/promises';
import path from 'node:path';
import exifr from 'exifr';

import type { PhotoExif } from '@types';
import { PHOTOS_DIR } from '@/consts';

const PHOTOS_ROOT = path.resolve(process.cwd(), PHOTOS_DIR);

/** Build-time cache so each photo's EXIF is parsed only once per build. */
const cache = new Map<string, Promise<PhotoExif>>();

// Only parse the tags we actually use. exifr infers which segments
// (IFD0 / EXIF / GPS) to read from the picked tag names.
const EXIFR_OPTIONS = {
  pick: [
    'Make',
    'Model',
    'LensModel',
    'LensMake',
    'FocalLength',
    'FocalLengthIn35mmFormat',
    'FNumber',
    'ApertureValue',
    'ExposureTime',
    'ShutterSpeedValue',
    'ISO',
    'ISOSpeedRatings',
    'DateTimeOriginal',
    'CreateDate',
    'ExifImageWidth',
    'ExifImageHeight',
    'Orientation',
    'latitude',
    'longitude',
    'GPSAltitude',
  ],
};

/** Compose a friendly camera label from Make + Model, de-duplicating words. */
function buildCameraLabel(make?: string, model?: string): string | undefined {
  if (!model && !make) return undefined;
  if (!model) return make;
  if (!make) return model;
  // Many cameras already include the make in the model (e.g. "NIKON Z6").
  return model.toUpperCase().includes(make.toUpperCase())
    ? model
    : `${make} ${model}`;
}

function toNumber(value: unknown): number | undefined {
  const n = typeof value === 'string' ? parseFloat(value) : (value as number);
  return typeof n === 'number' && !Number.isNaN(n) ? n : undefined;
}

function normalize(raw: Record<string, unknown>): PhotoExif {
  const make = (raw.Make as string)?.trim();
  const model = (raw.Model as string)?.trim();
  const lens = ((raw.LensModel as string) || (raw.LensMake as string))?.trim();

  const latitude = toNumber(raw.latitude);
  const longitude = toNumber(raw.longitude);

  const capturedRaw = (raw.DateTimeOriginal ?? raw.CreateDate) as
    | Date
    | string
    | undefined;
  const capturedAt =
    capturedRaw instanceof Date
      ? capturedRaw
      : capturedRaw
        ? new Date(capturedRaw)
        : undefined;

  return {
    make,
    model,
    camera: buildCameraLabel(make, model),
    lens: lens && lens.length > 0 ? lens : undefined,
    focalLength: toNumber(raw.FocalLength),
    focalLength35mm: toNumber(raw.FocalLengthIn35mmFormat),
    aperture: toNumber(raw.FNumber) ?? toNumber(raw.ApertureValue),
    shutterSpeed: toNumber(raw.ExposureTime),
    iso: toNumber(raw.ISO) ?? toNumber(raw.ISOSpeedRatings),
    capturedAt:
      capturedAt && !Number.isNaN(capturedAt.getTime()) ? capturedAt : undefined,
    width: toNumber(raw.ExifImageWidth),
    height: toNumber(raw.ExifImageHeight),
    orientation: toNumber(raw.Orientation),
    gps:
      latitude != null && longitude != null
        ? { latitude, longitude, altitude: toNumber(raw.GPSAltitude) }
        : undefined,
  };
}

/**
 * Extract normalized EXIF metadata for a photo by file name.
 * Reads the *original* file from the photos directory at build time.
 * Always resolves (returns an empty object if the file is missing or has no EXIF).
 */
export function getPhotoExif(filename: string): Promise<PhotoExif> {
  const cached = cache.get(filename);
  if (cached) return cached;

  const task = (async (): Promise<PhotoExif> => {
    try {
      const buffer = await fs.readFile(path.join(PHOTOS_ROOT, filename));
      const raw = (await exifr.parse(buffer, EXIFR_OPTIONS)) as
        | Record<string, unknown>
        | undefined;
      return raw ? normalize(raw) : {};
    } catch {
      // Missing file or unreadable EXIF — degrade gracefully.
      return {};
    }
  })();

  cache.set(filename, task);
  return task;
}
