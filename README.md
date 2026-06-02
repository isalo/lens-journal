# Lens Journal

A minimalist, **MDX-powered photo journal** toolkit. Point the `lens` CLI at a
folder of photographs and it reads their EXIF metadata — camera, lens, exposure,
GPS, capture date — and generates MDX journal entries for a beautiful, fast,
**database-free** Astro website.

> Local-first · markdown-first · privacy-friendly · zero database

Built with **Astro · TypeScript · MDX · Tailwind CSS · Sharp · exifr · MapLibre GL**.

---

## Create a new site

```bash
npm create lens-journal@latest my-journal
cd my-journal
npm install        # if you skipped the install prompt
npm run dev        # http://localhost:4321
```

Then import photos and start writing:

```bash
npx lens import ./photos   # read EXIF + copy photos + generate draft entries
npx lens validate          # check entries and photo references
npm run build              # static output in ./dist
```

## How it works

1. **Import.** `lens import` reads EXIF from your originals (cached), copies
   optimized photos into `public/photos/<year>/<month>/`, and writes one MDX
   entry per photo into `src/content/journal/` as a **draft**.
2. **Edit.** Open the generated MDX, add a story, set `status: published`, tweak
   the title, excerpt, tags, or location.
3. **Build.** Astro validates every entry against the shared Zod schema and
   renders the timeline, gallery, world map, and per-camera / per-lens pages.

Drafts are visible in `npm run dev` but hidden from production builds.

## Features

- **EXIF-aware import** — camera, lens, focal length, aperture, shutter, ISO,
  capture date and GPS pulled from your originals.
- **Interactive maps** — per-entry location maps and a global world map
  (MapLibre GL + OpenStreetMap tiles, no API key).
- **Browse by gear** — automatic Cameras and Lenses index/detail pages.
- **Timeline, Gallery, RSS, sitemap, SEO, dark mode**, fully responsive.
- **Static export** — deploy anywhere (Netlify, Vercel, GitHub Pages, S3…).
- **Schema-validated content** — the website and the CLI share one source of
  truth, so frontmatter can never drift.

## Monorepo layout

This repository is a pnpm + Turborepo workspace.

```
packages/
├── lens-core            # @lens-journal/core  — EXIF pipeline, schema, config, validation
├── lens-theme           # @lens-journal/theme — Tailwind preset, styles, view-model helpers
├── lens-cli             # lens-cli            — the `lens` command
└── create-lens-journal  # create-lens-journal — `npm create lens-journal` scaffolder
apps/
└── starter              # the reference Astro site (template source)
examples/                # showcase sites
```

| Package               | Published as          | Purpose                                                   |
| --------------------- | --------------------- | --------------------------------------------------------- |
| `lens-core`           | `@lens-journal/core`  | EXIF/photo pipeline, `journalEntrySchema`, config loader. |
| `lens-theme`          | `@lens-journal/theme` | Tailwind preset, base styles, entry view-model helpers.   |
| `lens-cli`            | `lens-cli`            | `lens import` / `validate` / `new` / `info`.              |
| `create-lens-journal` | `create-lens-journal` | Scaffolds a new site from the starter template.           |

## Entry frontmatter

Entries live in `src/content/journal/*.mdx` and are validated by
`@lens-journal/core`'s `journalEntrySchema`:

```mdx
---
title: Morning in Warsaw
slug: morning-in-warsaw
date: 2026-05-21
status: published # draft | published
coverPhoto: /photos/2026/05/warsaw.jpg
photos:
  - /photos/2026/05/warsaw.jpg
excerpt: First light over the Old Town.
tags: [travel, city]
camera: { make: Canon, model: Canon EOS 40D }
exif: { focalLength: 135mm, aperture: f/7.1, shutterSpeed: 1/160, iso: 100 }
gps: { latitude: 52.2297, longitude: 21.0122 }
location: { name: Warsaw, Poland }
---

Today I walked through the old town...
```

## Configuration

- **Site:** edit `src/consts.ts` for title, URL, author, navigation and map tiles.
- **CLI:** edit `lens.config.ts` for `contentDir`, `photosDir`, `timezone`,
  `defaultStatus`, image quality, and the map provider.

## Develop the toolkit

```bash
pnpm install
pnpm build        # build all packages + the starter (Turborepo)
pnpm typecheck
pnpm test
pnpm lint
pnpm format
```

## Releasing

Versioning and npm publishing are automated with
[Changesets](https://github.com/changesets/changesets) via
`.github/workflows/release.yml`. Add a changeset with `pnpm changeset`, merge to
`main`, and the workflow opens a version PR / publishes. See
[`docs/RELEASING.md`](docs/RELEASING.md) for the required tokens.

## License

MIT
