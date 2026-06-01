import { describe, expect, it } from 'vitest';

import { generateSlug, slugify, toIsoDate, uniqueSlug } from './slug.js';

describe('slugify', () => {
  it('lowercases and dasherizes', () => {
    expect(slugify('Morning in Warsaw')).toBe('morning-in-warsaw');
  });

  it('strips diacritics', () => {
    expect(slugify('Kraków Café')).toBe('krakow-cafe');
  });

  it('collapses separators and trims', () => {
    expect(slugify('  --Hello___World!!  ')).toBe('hello-world');
  });
});

describe('toIsoDate', () => {
  it('formats as YYYY-MM-DD', () => {
    expect(toIsoDate(new Date('2026-06-02T10:30:00Z'))).toBe('2026-06-02');
  });
});

describe('generateSlug', () => {
  it('combines date and filename base', () => {
    const date = new Date('2026-06-02T10:00:00Z');
    expect(generateSlug(date, 'IMG_001.JPG')).toBe('2026-06-02-img-001');
  });

  it('falls back to just the date for empty names', () => {
    const date = new Date('2026-06-02T10:00:00Z');
    expect(generateSlug(date, '___.jpg')).toBe('2026-06-02');
  });
});

describe('uniqueSlug', () => {
  it('returns the slug when unused', () => {
    expect(uniqueSlug('a', new Set())).toBe('a');
  });

  it('suffixes when taken', () => {
    expect(uniqueSlug('a', new Set(['a', 'a-2']))).toBe('a-3');
  });
});
