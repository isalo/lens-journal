import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import * as p from '@clack/prompts';
import color from 'picocolors';

const TEMPLATE_DIR = path.resolve(
  fileURLToPath(import.meta.url),
  '../../template',
);

type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

function detectPackageManager(): PackageManager {
  const ua = process.env.npm_config_user_agent ?? '';
  if (ua.startsWith('pnpm')) return 'pnpm';
  if (ua.startsWith('yarn')) return 'yarn';
  if (ua.startsWith('bun')) return 'bun';
  return 'npm';
}

function isEmpty(dir: string): boolean {
  if (!fs.existsSync(dir)) return true;
  const entries = fs.readdirSync(dir).filter((e) => e !== '.git');
  return entries.length === 0;
}

/** Recursively copy the template, renaming `_gitignore` -> `.gitignore`. */
function copyTemplate(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const targetName = entry.name === '_gitignore' ? '.gitignore' : entry.name;
    const to = path.join(dest, targetName);
    if (entry.isDirectory()) {
      copyTemplate(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

function setProjectName(dir: string, name: string): void {
  const pkgPath = path.join(dir, 'package.json');
  if (!fs.existsSync(pkgPath)) return;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.name = name;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

function sanitizeName(input: string): string {
  return (
    path
      .basename(input)
      .toLowerCase()
      .replace(/[^a-z0-9-~]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'lens-journal'
  );
}

function runInstall(pm: PackageManager, cwd: string): boolean {
  const result = spawnSync(pm, ['install'], { cwd, stdio: 'inherit' });
  return result.status === 0;
}

async function main(): Promise<void> {
  console.clear();
  p.intro(color.bgMagenta(color.black(' create-lens-journal ')));

  const argTarget = process.argv[2];

  const target =
    argTarget ??
    (await p.text({
      message: 'Where should we create your journal?',
      placeholder: './my-lens-journal',
      defaultValue: './my-lens-journal',
      validate(value) {
        if (value && value.trim().startsWith('-')) {
          return 'Path cannot start with a dash.';
        }
        return undefined;
      },
    }));

  if (p.isCancel(target)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }

  const targetDir = path.resolve(process.cwd(), target as string);
  const projectName = sanitizeName(targetDir);

  if (!isEmpty(targetDir)) {
    const overwrite = await p.confirm({
      message: `${color.yellow(targetDir)} is not empty. Continue anyway?`,
      initialValue: false,
    });
    if (p.isCancel(overwrite) || !overwrite) {
      p.cancel('Aborted to avoid overwriting files.');
      process.exit(0);
    }
  }

  const pm = detectPackageManager();
  const install = await p.confirm({
    message: `Install dependencies with ${color.cyan(pm)} now?`,
    initialValue: true,
  });
  if (p.isCancel(install)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }

  const s = p.spinner();
  s.start('Scaffolding your journal');
  try {
    copyTemplate(TEMPLATE_DIR, targetDir);
    setProjectName(targetDir, projectName);
  } catch (err) {
    s.stop('Failed to scaffold project.');
    p.log.error((err as Error).message);
    process.exit(1);
  }
  s.stop('Project files created.');

  if (install) {
    const ok = runInstall(pm, targetDir);
    if (!ok) {
      p.log.warn(
        `Dependency install failed — you can run "${pm} install" yourself later.`,
      );
    }
  }

  const rel = path.relative(process.cwd(), targetDir) || '.';
  const runCmd = pm === 'npm' ? 'npm run' : pm;
  const steps = [
    `cd ${rel}`,
    ...(install ? [] : [`${pm} install`]),
    `${runCmd} dev`,
  ];

  p.note(steps.join('\n'), 'Next steps');
  p.outro(
    `${color.green('Done!')} Import your photos with ${color.cyan('npx lens import ./photos')} and start writing. ` +
      `Docs: ${color.underline('https://github.com/lens-journal/lens-journal')}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
