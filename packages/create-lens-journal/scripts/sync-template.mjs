// Regenerates `template/` from `apps/starter` so the scaffolder always ships
// the latest theme. Run automatically before build. Transforms applied:
//   - package.json: workspace deps -> published ranges, neutral name/desc.
//   - .gitignore added as `_gitignore` (npm strips real .gitignore from tarballs).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(here, '..');
const repoRoot = path.resolve(pkgRoot, '..', '..');
const starterDir = path.join(repoRoot, 'apps', 'starter');
const templateDir = path.join(pkgRoot, 'template');

const IGNORE = new Set([
  'node_modules',
  'dist',
  '.astro',
  '.turbo',
  '.lens',
  '.DS_Store',
]);

/** The version published to npm for the @lens-journal/* packages. */
const DEP_VERSION = '^0.1.0';

function rimraf(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (IGNORE.has(entry.name)) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

function transformPackageJson() {
  const pkgPath = path.join(templateDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  pkg.name = 'my-lens-journal';
  pkg.version = '0.1.0';
  pkg.private = true;
  delete pkg.publishConfig;

  for (const field of ['dependencies', 'devDependencies']) {
    const deps = pkg[field];
    if (!deps) continue;
    for (const name of Object.keys(deps)) {
      if (
        deps[name] === 'workspace:*' ||
        String(deps[name]).startsWith('workspace:')
      ) {
        deps[name] = DEP_VERSION;
      }
    }
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

function writeGitignore() {
  const content = [
    'node_modules/',
    'dist/',
    '.astro/',
    '.lens/cache/',
    '.env',
    '.DS_Store',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(templateDir, '_gitignore'), content);
}

function main() {
  if (!fs.existsSync(starterDir)) {
    throw new Error(`Starter app not found at ${starterDir}`);
  }
  rimraf(templateDir);
  copyDir(starterDir, templateDir);
  transformPackageJson();
  writeGitignore();
  console.log(
    `Synced template from apps/starter -> ${path.relative(repoRoot, templateDir)}`,
  );
}

main();
