# create-lens-journal

Scaffold a new [Lens Journal](https://github.com/lens-journal/lens-journal) photo-journal site in seconds.

## Usage

```bash
# npm
npm create lens-journal@latest

# pnpm
pnpm create lens-journal

# yarn
yarn create lens-journal

# bun
bun create lens-journal
```

You can also pass the target directory directly:

```bash
npm create lens-journal@latest my-journal
```

The CLI will:

1. Copy the starter template (an Astro site wired to `@lens-journal/theme`).
2. Set your project name.
3. Optionally install dependencies with your detected package manager.

## After scaffolding

```bash
cd my-journal
npm install        # if you skipped install
npm run dev        # start the dev server

npx lens import ./photos   # import EXIF-aware photos into entries
```

## What you get

- A production-ready Astro site with a timeline, gallery, world map, and
  per-camera / per-lens browsing.
- Shared design tokens from `@lens-journal/theme`.
- Content validated by the same schema the `lens` CLI writes, so frontmatter
  never drifts.

See the [main documentation](https://github.com/lens-journal/lens-journal) for
the full workflow.
