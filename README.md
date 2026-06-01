# Lens Journal

A minimalist, **MDX-powered photo journal** that turns photographs, stories,
location and EXIF metadata into a beautiful, fast static website.

> Local-first · markdown-first · privacy-friendly · zero database

Built with **Astro · TypeScript · MDX · Tailwind CSS · Sharp · exifr · MapLibre GL**.

---

## Features

- **MDX entries** — write stories in Markdown/MDX and attach a photograph.
- **Automatic EXIF extraction** — camera, lens, focal length, aperture, shutter,
  ISO and capture date pulled from your originals at build time.
- **GPS support** — interactive per-entry maps and a global world map, with a
  manual `coordinates` / `location` override for privacy.
- **Journal pages** — hero photo, story, metadata panel, location map.
- **Timeline** (home), **Gallery**, **World map**, **Cameras**, **Lenses** pages.
- **Dark mode**, **RSS feed**, **sitemap**, **SEO** meta, fully **responsive**.
- **Static export** — deploy anywhere (Netlify, Vercel, GitHub Pages, S3…).

## Quick start

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in ./dist
npm run preview  # preview the production build
```

## Write a new entry

1. Create `src/content/entries/<slug>/index.mdx`:

   ```mdx
   ---
   title: Morning in Warsaw
   date: 2026-05-21
   photo: warsaw.jpg          # file name in src/assets/photos
   summary: First light over the Old Town.
   location: Warsaw, Poland   # optional; falls back to EXIF GPS
   tags: [travel, city]
   gallery: [warsaw-2.jpg]    # optional extra photos
   ---

   Today I walked through the old town...
   ```

2. Drop the photograph into `src/assets/photos/` (e.g. `warsaw.jpg`).
   EXIF is read from this original; Sharp serves optimized versions.

That's it — the timeline, gallery, map, camera and lens pages update themselves.

## Configuration

Edit `src/consts.ts` for site title, URL, author, navigation and map tiles.

## Project structure

```
src/
├── content/entries/<slug>/index.mdx   # journal entries (MDX)
├── assets/photos/*.jpg                 # original photographs (EXIF source)
├── content.config.ts                   # content collection schema (Zod)
├── consts.ts                           # site configuration
├── types/                              # domain TypeScript types
├── lib/                                # services
│   ├── exif.ts        # exifr-based EXIF extraction (cached, build-time)
│   ├── photos.ts      # Sharp image registry + photo resolution
│   ├── entries.ts     # collection queries, grouping, map markers
│   ├── geo.ts         # slugify, GPS validation, region fallback
│   └── format.ts      # date / exposure formatting helpers
├── components/
│   ├── layout/        # Header, Footer
│   ├── photo/         # PhotoFrame, MetadataPanel, ExifBadge
│   ├── map/           # LocationMap, WorldMap (MapLibre GL)
│   ├── ui/            # ThemeToggle, PageIntro
│   ├── EntryCard.astro · GalleryGrid.astro · GearCard.astro · SEO.astro
├── layouts/           # BaseLayout, EntryLayout
├── pages/
│   ├── index.astro            # timeline / home
│   ├── entries/[...slug].astro
│   ├── gallery.astro · map.astro · about.astro
│   ├── cameras/index.astro · cameras/[camera].astro
│   ├── lenses/index.astro · lenses/[lens].astro
│   └── rss.xml.ts
└── styles/global.css
```

## Architecture notes

- **Zero backend / zero database.** Everything is resolved at build time from
  the filesystem and shipped as static HTML/CSS/JS.
- **EXIF pipeline.** `lib/exif.ts` reads originals with `exifr` (cached per
  build) and normalizes them into a strongly-typed `PhotoExif`. `lib/photos.ts`
  joins that with Sharp-optimized `ImageMetadata`.
- **Privacy.** No analytics or third-party scripts by default. Maps use
  OpenStreetMap raster tiles (no API key). Use `location` to avoid publishing
  precise GPS coordinates.

## Production roadmap

- Build-time reverse geocoding (optional Nominatim cache) for place names.
- Map clustering for dense locations.
- Lightbox / full-screen gallery viewer.
- Tag pages and search.
- Optional dynamic OG image generation per entry.
- EXIF privacy stripping toggle for published images.

## License

MIT
