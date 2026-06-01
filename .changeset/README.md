# Changesets

This folder is managed by [Changesets](https://github.com/changesets/changesets).

To record a change for the next release, run:

```bash
pnpm changeset
```

Pick the affected packages and a semver bump (patch/minor/major), then commit the
generated markdown file. On merge to `main`, the release workflow opens a
"Version Packages" PR; merging that PR publishes the packages to npm.
