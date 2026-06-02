import { defineConfig } from '@lens-journal/core';

/**
 * Lens Journal configuration. The `lens` CLI reads this file to know where to
 * put imported photos and generated entries. See the docs for every option.
 */
export default defineConfig({
  contentDir: 'src/content/journal',
  photosDir: 'public/photos',
  outputDir: 'dist',
  timezone: 'Europe/Warsaw',
  defaultStatus: 'draft',
  imageQuality: 85,
  generateResponsiveImages: true,
  mapProvider: 'maplibre',
});
