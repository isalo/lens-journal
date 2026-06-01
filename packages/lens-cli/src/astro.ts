import { spawn } from 'node:child_process';
import path from 'node:path';
import { existsSync } from 'node:fs';

/**
 * Run an Astro subcommand (`dev`, `build`, `preview`, …) inside the project.
 *
 * Prefers the project-local `astro` binary; falls back to `npx astro` so the
 * CLI works even outside a fully-installed workspace. Resolves with the child
 * process exit code.
 */
export function runAstro(cwd: string, args: string[]): Promise<number> {
  const localBin = path.join(
    cwd,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'astro.cmd' : 'astro',
  );

  const useLocal = existsSync(localBin);
  const command = useLocal ? localBin : 'npx';
  const finalArgs = useLocal ? args : ['--no-install', 'astro', ...args];

  return new Promise((resolve, reject) => {
    const child = spawn(command, finalArgs, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    child.on('error', reject);
    child.on('close', (code) => resolve(code ?? 0));
  });
}
