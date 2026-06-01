import fs from 'node:fs/promises';
import exifr from 'exifr';

import type { GPS } from './types.js';

/** The subset of {@link PhotoMetadata} that comes from EXIF. */
export interface ExifData {
  cameraMake?: string;
  cameraModel?: string;
  lensModel?: string;
  focalLength?: number;
  focalLength35mm?: number;
  aperture?: number;
  shutterSpeed?: number;
  iso?: number;
  capturedAt?: Date;
  width?: number;
  height?: number;
  orientation?: number;
  gps?: GPS;
}

// Only parse the tags we use. exifr infers which segments to read.
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

function toNumber(value: unknown): number | undefined {
  const n = typeof value === 'string' ? parseFloat(value) : (value as number);
  return typeof n === 'number' && !Number.isNaN(n) ? n : undefined;
}

function normalize(raw: Record<string, unknown>): ExifData {
  const make = (raw.Make as string)?.trim() || undefined;
  const model = (raw.Model as string)?.trim() || undefined;
  const lens =
    ((raw.LensModel as string) || (raw.LensMake as string))?.trim() ||
    undefined;

  const latitude = toNumber(raw.latitude);
  const longitude = toNumber(raw.longitude);

  const capturedRaw = (raw.DateTimeOriginal ?? raw.CreateDate) as
    | Date
    | string
    | undefined;
  const captured =
    capturedRaw instanceof Date
      ? capturedRaw
      : capturedRaw
        ? new Date(capturedRaw)
        : undefined;
  const capturedAt =
    captured && !Number.isNaN(captured.getTime()) ? captured : undefined;

  const gps: GPS | undefined =
    latitude != null && longitude != null
      ? { latitude, longitude, altitude: toNumber(raw.GPSAltitude) }
      : undefined;

  return {
    cameraMake: make,
    cameraModel: model,
    lensModel: lens,
    focalLength: toNumber(raw.FocalLength),
    focalLength35mm: toNumber(raw.FocalLengthIn35mmFormat),
    aperture: toNumber(raw.FNumber) ?? toNumber(raw.ApertureValue),
    shutterSpeed: toNumber(raw.ExposureTime),
    iso: toNumber(raw.ISO) ?? toNumber(raw.ISOSpeedRatings),
    capturedAt,
    width: toNumber(raw.ExifImageWidth),
    height: toNumber(raw.ExifImageHeight),
    orientation: toNumber(raw.Orientation),
    gps,
  };
}

/**
 * Extract normalized EXIF metadata from an in-memory image buffer.
 * Returns an empty object when there is no parseable EXIF.
 */
export async function extractExifFromBuffer(
  buffer: Buffer | Uint8Array,
): Promise<ExifData> {
  const raw = (await exifr.parse(buffer, EXIFR_OPTIONS)) as
    | Record<string, unknown>
    | undefined;
  return raw ? normalize(raw) : {};
}

/**
 * Extract normalized EXIF metadata from an image file on disk.
 * Degrades gracefully (returns `{}`) when the file is missing or has no EXIF.
 */
export async function extractExif(filePath: string): Promise<ExifData> {
  try {
    const buffer = await fs.readFile(filePath);
    return await extractExifFromBuffer(buffer);
  } catch {
    return {};
  }
}

/** Compose a friendly camera label from make + model, de-duplicating words. */
export function buildCameraLabel(
  make?: string,
  model?: string,
): string | undefined {
  if (!model && !make) return undefined;
  if (!model) return make;
  if (!make) return model;
  return model.toUpperCase().includes(make.toUpperCase())
    ? model
    : `${make} ${model}`;
}
