import { createContext, type GlobalOptions } from '../context.js';
import { runAstro } from '../astro.js';
import { validateCommand } from './validate.js';
import { log, pc, title } from '../logger.js';

export interface BuildOptions extends GlobalOptions {
  /** Skip the pre-build validation step. */
  skipValidate?: boolean;
}

/**
 * `lens build` — validate content, then run `astro build`.
 *
 * Validation warnings are reported but do not block the build; validation
 * errors abort before invoking Astro.
 */
export async function buildCommand(options: BuildOptions): Promise<void> {
  const ctx = await createContext(options);
  title('build');

  if (!options.skipValidate) {
    const ok = await validateCommand({ ...options, quiet: true });
    if (!ok) {
      log.error('Validation failed — fix the errors above or pass --skip-validate.');
      process.exitCode = 1;
      return;
    }
    log.success('Content validated.');
  }

  log.step(`Building with Astro → ${pc.cyan(ctx.config.outputDir)}`);
  const code = await runAstro(ctx.cwd, ['build']);
  process.exitCode = code;
}
