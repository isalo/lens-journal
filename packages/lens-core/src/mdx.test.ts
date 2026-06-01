import { describe, expect, it } from 'vitest';

import { buildEntryFromPhoto, renderEntryMdx } from './mdx.js';
import { splitFrontmatter } from './parse.js';
import type { PhotoMetadata } from './types.js';

const photo: PhotoMetadata = {
  filePath: '/abs/public/photos/2026/06/img-001.jpg',
  publicPath: '/photos/2026/06/img-001.jpg',
  hash: 'abc',
  width: 6000,
  height: 4000,
  capturedAt: new Date('2026-06-02T08:15:00Z'),
  cameraMake: 'Fujifilm',
  cameraModel: 'X-T5',
  lensModel: 'XF 35mm F1.4',
  focalLength: 35,
  aperture: 2,
  shutterSpeed: 1 / 250,
  iso: 125,
  gps: { latitude: 52.2297, longitude: 21.0122 },
};

describe('buildEntryFromPhoto', () => {
  it('derives slug, date, status and nested metadata', () => {
    const entry = buildEntryFromPhoto(photo, { status: 'draft' });
    expect(entry.slug).toBe('2026-06-02-img-001');
    expect(entry.date).toBe('2026-06-02');
    expect(entry.status).toBe('draft');
    expect(entry.coverPhoto).toBe('/photos/2026/06/img-001.jpg');
    expect(entry.camera).toEqual({ make: 'Fujifilm', model: 'X-T5' });
    expect(entry.lens).toEqual({ model: 'XF 35mm F1.4' });
    expect(entry.exif).toMatchObject({
      focalLength: '35mm',
      aperture: 'f/2',
      shutterSpeed: '1/250',
      iso: 125,
    });
    expect(entry.gps).toEqual({ latitude: 52.2297, longitude: 21.0122 });
  });
});

describe('renderEntryMdx', () => {
  it('produces valid round-trippable frontmatter', () => {
    const entry = buildEntryFromPhoto(photo, { status: 'draft' });
    const mdx = renderEntryMdx(entry, 'Hello world');
    expect(mdx.startsWith('---\n')).toBe(true);
    expect(mdx).toContain('Hello world');

    const { data, body } = splitFrontmatter(mdx);
    expect((data as { title: string }).title).toBeTruthy();
    expect((data as { slug: string }).slug).toBe('2026-06-02-img-001');
    expect(body.trim()).toBe('Hello world');
  });

  it('omits empty/undefined fields', () => {
    const minimal: PhotoMetadata = {
      filePath: '/x.jpg',
      publicPath: '/photos/x.jpg',
      hash: 'h',
      capturedAt: new Date('2026-01-01T00:00:00Z'),
    };
    const mdx = renderEntryMdx(buildEntryFromPhoto(minimal));
    expect(mdx).not.toContain('camera:');
    expect(mdx).not.toContain('lens:');
    expect(mdx).not.toContain('gps:');
  });
});
