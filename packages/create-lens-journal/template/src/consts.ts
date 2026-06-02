/**
 * Global, build-time site configuration.
 * Edit this file to make Lens Journal your own.
 */
export const SITE = {
  /** Canonical production URL (used for sitemap, RSS, SEO, og:url). */
  url: 'https://lens-journal.example.com',
  title: 'Lens Journal',
  tagline: 'A photo journal of light, places and moments.',
  description:
    'A minimalist, MDX-powered photo journal that turns photographs, stories, location and EXIF metadata into a beautiful static website.',
  author: {
    name: 'Lens Journal',
    email: 'hello@example.com',
    url: 'https://lens-journal.example.com',
  },
  /** Default social/SEO image, relative to /public. */
  ogImage: '/og-default.svg',
  locale: 'en',
  themeColor: '#16161a',
} as const;

export const NAV_LINKS = [
  { href: '/', label: 'Journal' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/map', label: 'Map' },
  { href: '/cameras', label: 'Cameras' },
  { href: '/lenses', label: 'Lenses' },
  { href: '/about', label: 'About' },
] as const;

/** MapLibre raster style using OpenStreetMap tiles — no API key required. */
export const MAP = {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
  defaultZoom: 11,
  worldZoom: 1.4,
  maxZoom: 18,
} as const;
