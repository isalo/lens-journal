# Releasing

Publishing is automated by [Changesets](https://github.com/changesets/changesets)
in `.github/workflows/release.yml`. The workflow needs two secrets — but you only
**create one token yourself** (the npm one).

## The three env vars in the workflow

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
  NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }} # same token as NPM_TOKEN
```

### 1. `GITHUB_TOKEN` — automatic, nothing to create

GitHub Actions injects `secrets.GITHUB_TOKEN` into every run. You do **not**
generate it. You only need to allow it to open the "version packages" PR:

- Repo → **Settings → Actions → General → Workflow permissions**
  - Select **Read and write permissions**.
  - Tick **Allow GitHub Actions to create and approve pull requests**.

(The workflow's `permissions:` block already requests `contents: write` and
`pull-requests: write`.)

### 2. `NPM_TOKEN` — you create this on npmjs.com

1. Sign in at <https://www.npmjs.com>.
2. Avatar (top-right) → **Access Tokens** → **Generate New Token**.
3. Choose a token that works in CI with 2FA:
   - **Granular Access Token** (recommended): set an expiry, scope it to the
     `@lens-journal` packages / your org, and grant **Read and write**.
   - Or **Classic token → Automation** (bypasses 2FA on publish).
4. Copy the value (starts with `npm_…`) — it is shown **once**.
5. Add it to the repo: **Settings → Secrets and variables → Actions → New
   repository secret**
   - **Name:** `NPM_TOKEN`
   - **Value:** the `npm_…` token

### 3. `NODE_AUTH_TOKEN` — reuses `NPM_TOKEN`

This is **not** a separate token. `actions/setup-node` (with `registry-url`)
reads `NODE_AUTH_TOKEN` to write the auth line into `.npmrc` so `npm publish`
is authenticated. We point it at the same `secrets.NPM_TOKEN`, so there is
nothing extra to create.

## One-time npm setup before the first publish

- The `@lens-journal` scope must exist and be owned by your npm account/org.
  Create it for free: npmjs.com → **Add Organization** (or publish under a scope
  you already own and update the package names).
- Each package sets `"publishConfig": { "access": "public" }`, required to
  publish scoped packages publicly for free.
- The very first publish of a brand-new package name sometimes needs to be run
  locally once (`pnpm release`) before CI can take over.

## Cutting a release

```bash
pnpm changeset        # describe the change + pick semver bumps
git add . && git commit -m "feat: …"
git push              # merge to main
```

On `main`, the Release workflow either:

- opens/updates a **"chore: version packages"** PR (applies the changesets and
  bumps versions), or
- if such a PR was just merged, **publishes** the updated packages to npm.

Private packages (`@lens-journal/starter`, `@lens-journal/demo-journal`) are
listed under `ignore` in `.changeset/config.json` and are never published.
