import { createContext, type GlobalOptions } from '../context.js';
import { runAstro } from '../astro.js';
import { log, title } from '../logger.js';

/**
 * `lens dev` — start the Astro dev server.
 *
 * In a future release this will optionally mount a local admin UI at `/admin`;
 * for now it simply proxies to `astro dev`.
 */
export async function devCommand(
  options: GlobalOptions & { port?: string },
): Promise<void> {
  const ctx = await createContext(options);
  title('dev');
  log.dim('Starting Astro dev server… (admin UI coming in a future release)');

  const args = ['dev'];
  if (options.port) args.push('--port', options.port);

  const code = await runAstro(ctx.cwd, args);
  process.exitCode = code;
}
