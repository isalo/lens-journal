import type { GeoPoint } from '@types';

/** Convert an arbitrary string into a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

/** True when a GeoPoint has usable, in-range coordinates. */
export function hasValidLocation(gps?: GeoPoint | null): gps is GeoPoint {
  if (!gps) return false;
  const { latitude, longitude } = gps;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return false;
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return false;
  if (latitude === 0 && longitude === 0) return false; // null island
  return Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;
}

/**
 * Offline, dependency-free reverse-geocode fallback.
 * Returns a coarse hemisphere/region label so the UI always has *something*
 * to show without contacting a third-party service (privacy-friendly).
 * For precise place names, set `location` in the entry frontmatter.
 */
export function approximateRegion(gps: GeoPoint): string {
  const ns = gps.latitude >= 0 ? 'N' : 'S';
  const ew = gps.longitude >= 0 ? 'E' : 'W';
  return `${Math.abs(gps.latitude).toFixed(1)}\u00b0${ns}, ${Math.abs(
    gps.longitude,
  ).toFixed(1)}\u00b0${ew}`;
}
