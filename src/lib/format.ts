import type { PhotoExif } from '@types';

/** Format a date for display, e.g. "21 May 2026". */
export function formatDate(date: Date, locale = 'en-GB'): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/** Short machine-friendly ISO date (YYYY-MM-DD). */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Format aperture as f-number, e.g. 2.8 -> "f/2.8". */
export function formatAperture(value?: number): string | undefined {
  if (value == null) return undefined;
  // Drop trailing ".0" for whole stops (f/8 not f/8.0).
  const rounded = Math.round(value * 10) / 10;
  return `f/${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}`;
}

/** Format shutter speed in seconds, e.g. 0.005 -> "1/200s", 2 -> "2s". */
export function formatShutter(seconds?: number): string | undefined {
  if (seconds == null) return undefined;
  if (seconds >= 1) {
    const rounded = Math.round(seconds * 10) / 10;
    return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}s`;
  }
  const denominator = Math.round(1 / seconds);
  return `1/${denominator}s`;
}

/** Format focal length, e.g. 35 -> "35mm". */
export function formatFocalLength(mm?: number): string | undefined {
  if (mm == null) return undefined;
  return `${Math.round(mm)}mm`;
}

/** Format ISO sensitivity, e.g. 400 -> "ISO 400". */
export function formatIso(iso?: number): string | undefined {
  if (iso == null) return undefined;
  return `ISO ${iso}`;
}

/** Format decimal coordinates compactly, e.g. "52.2297, 21.0122". */
export function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

/** A compact exposure summary line, e.g. "35mm · f/2.8 · 1/200s · ISO 400". */
export function exposureSummary(exif: PhotoExif): string {
  return [
    formatFocalLength(exif.focalLength),
    formatAperture(exif.aperture),
    formatShutter(exif.shutterSpeed),
    formatIso(exif.iso),
  ]
    .filter(Boolean)
    .join(' \u00b7 ');
}
