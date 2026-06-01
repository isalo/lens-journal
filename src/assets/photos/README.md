# Photographs

Drop your original photographs here (`.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`).

- Reference a photo from an entry's frontmatter by **file name only**, e.g.
  `photo: warsaw.jpg`.
- EXIF metadata (camera, lens, exposure, GPS) is extracted from these originals
  at build time. Keep the originals untouched — Astro + Sharp generate the
  optimized, resized versions that ship to the browser.
- If a referenced photo is missing, the entry renders a graceful placeholder so
  the build never breaks.

The sample entries reference `warsaw.jpg`, `fjord.jpg`, and `kyoto.jpg`. Add
your own files with those names (or edit the frontmatter) to see them appear.
