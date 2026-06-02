/**
 * @lens-journal/theme
 *
 * Framework-agnostic view-model helpers for rendering journal entries, plus a
 * re-export of the core data model and Zod schema (so Astro content
 * collections can validate against the same shape the CLI writes).
 *
 * The Tailwind preset and base styles are shipped as separate entry points:
 *   - `@lens-journal/theme/tailwind-preset`
 *   - `@lens-journal/theme/styles/global.css`
 */
import type {
  GPS,
  JournalEntryFrontmatter,
} from '@lens-journal/core';
import { hasValidLocation } from '@lens-journal/core';

export {
  journalEntrySchema,
  slugify,
  hasValidLocation,
  formatDate,
  type JournalEntryFrontmatter,
  type GPS,
  type EntryStatus,
} from '@lens-journal/core';

/** True when an entry should be visible in production listings. */
export function isPublished(fm: JournalEntryFrontmatter): boolean {
  return fm.status === 'published';
}

/** A compact exposure line, e.g. "35mm · f/2 · 1/250 · ISO 125". */
export function exposureSummary(fm: JournalEntryFrontmatter): string {
  const e = fm.exif;
  if (!e) return '';
  return [
    e.focalLength,
    e.aperture,
    e.shutterSpeed,
    e.iso != null ? `ISO ${e.iso}` : undefined,
  ]
    .filter(Boolean)
    .join(' \u00b7 ');
}

/** The display label for an entry's camera, e.g. "Fujifilm X-T5". */
export function cameraLabel(fm: JournalEntryFrontmatter): string | undefined {
  const c = fm.camera;
  if (!c) return undefined;
  if (c.make && c.model) {
    return c.model.toUpperCase().includes(c.make.toUpperCase())
      ? c.model
      : `${c.make} ${c.model}`;
  }
  return c.model ?? c.make;
}

/** The display label for an entry's lens. */
export function lensLabel(fm: JournalEntryFrontmatter): string | undefined {
  return fm.lens?.model;
}

/** The effective place name for an entry (location.name when present). */
export function locationLabel(
  fm: JournalEntryFrontmatter,
): string | undefined {
  return fm.location?.name;
}

/** The effective coordinates for an entry, when valid. */
export function entryCoords(fm: JournalEntryFrontmatter): GPS | undefined {
  return hasValidLocation(fm.gps) ? fm.gps : undefined;
}

/** Sort comparator: newest entries first. */
export function byNewest(
  a: { date: Date },
  b: { date: Date },
): number {
  return b.date.getTime() - a.date.getTime();
}
