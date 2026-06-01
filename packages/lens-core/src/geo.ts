import type { GPS } from './types.js';

/** True when a GPS point has usable, in-range coordinates. */
export function hasValidLocation(gps?: GPS | null): gps is GPS {
  if (!gps) return false;
  const { latitude, longitude } = gps;
  if (typeof latitude !== 'number' || typeof longitude !== 'number')
    return false;
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return false;
  if (latitude === 0 && longitude === 0) return false; // null island
  return Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;
}

/**
 * Offline, dependency-free coordinate label. Returns a coarse "lat°N, lng°E"
 * string so the UI always has something to show without any third-party
 * service. For precise place names, set `location.name` in frontmatter.
 */
export function approximateRegion(gps: GPS): string {
  const ns = gps.latitude >= 0 ? 'N' : 'S';
  const ew = gps.longitude >= 0 ? 'E' : 'W';
  return `${Math.abs(gps.latitude).toFixed(1)}\u00b0${ns}, ${Math.abs(
    gps.longitude,
  ).toFixed(1)}\u00b0${ew}`;
}
