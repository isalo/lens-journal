/** Format aperture as an f-number, e.g. 2.8 -> "f/2.8". */
export function formatAperture(value?: number): string | undefined {
  if (value == null) return undefined;
  const rounded = Math.round(value * 10) / 10;
  return `f/${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}`;
}

/** Format shutter speed in seconds, e.g. 0.005 -> "1/200", 2 -> "2s". */
export function formatShutter(seconds?: number): string | undefined {
  if (seconds == null) return undefined;
  if (seconds >= 1) {
    const rounded = Math.round(seconds * 10) / 10;
    return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}s`;
  }
  const denominator = Math.round(1 / seconds);
  return `1/${denominator}`;
}

/** Format focal length, e.g. 35 -> "35mm". */
export function formatFocalLength(mm?: number): string | undefined {
  if (mm == null) return undefined;
  return `${Math.round(mm)}mm`;
}

/** Format a date for display, e.g. "2 June 2026". */
export function formatDate(date: Date, locale = 'en-GB'): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
