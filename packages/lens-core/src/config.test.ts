import { describe, expect, it } from 'vitest';

import { resolveConfig } from './config.js';

describe('resolveConfig', () => {
  it('applies defaults', () => {
    const config = resolveConfig();
    expect(config.contentDir).toBe('src/content/journal');
    expect(config.photosDir).toBe('public/photos');
    expect(config.defaultStatus).toBe('draft');
    expect(config.imageQuality).toBe(85);
    expect(config.mapProvider).toBe('maplibre');
    expect(config.generateResponsiveImages).toBe(true);
  });

  it('merges user overrides', () => {
    const config = resolveConfig({
      timezone: 'Europe/Warsaw',
      imageQuality: 92,
    });
    expect(config.timezone).toBe('Europe/Warsaw');
    expect(config.imageQuality).toBe(92);
  });

  it('rejects invalid image quality', () => {
    expect(() => resolveConfig({ imageQuality: 0 })).toThrow();
  });
});
