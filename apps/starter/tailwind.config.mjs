import lensPreset from '@lens-journal/theme/tailwind-preset';

/**
 * Design tokens live in the shared `@lens-journal/theme` preset so every Lens
 * Journal site looks consistent. Override or extend `theme.extend` here.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  presets: [lensPreset],
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
};
