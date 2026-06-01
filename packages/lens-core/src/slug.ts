import path from 'node:path';

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

/** Format a Date as YYYY-MM-DD (UTC). */
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Build an entry slug from a capture date and the source file name, e.g.
 * (2026-06-02, "IMG_001.JPG") -> "2026-06-02-img-001".
 */
export function generateSlug(date: Date, filename: string): string {
  const base = path.basename(filename, path.extname(filename));
  const datePart = toIsoDate(date);
  const namePart = slugify(base);
  return namePart ? `${datePart}-${namePart}` : datePart;
}

/** Ensure a slug is unique against a set of existing slugs by suffixing -2, -3… */
export function uniqueSlug(slug: string, existing: Set<string>): string {
  if (!existing.has(slug)) return slug;
  let n = 2;
  while (existing.has(`${slug}-${n}`)) n += 1;
  return `${slug}-${n}`;
}
