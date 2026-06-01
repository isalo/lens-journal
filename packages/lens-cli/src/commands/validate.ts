import { validateProject, type Diagnostic } from '@lens-journal/core';

import { createContext, type GlobalOptions } from '../context.js';
import { log, pc, title } from '../logger.js';

function printDiagnostic(d: Diagnostic): void {
  const tag = d.level === 'error' ? pc.red('error') : pc.yellow('warn');
  const where = d.source ? pc.dim(` [${d.source}]`) : '';
  console.log(`  ${tag}${where} ${d.message} ${pc.dim(`(${d.code})`)}`);
}

/** `lens validate` — check content integrity. Returns true when valid. */
export async function validateCommand(
  options: GlobalOptions & { quiet?: boolean },
): Promise<boolean> {
  const ctx = await createContext(options);
  if (!options.quiet) title('validate');

  const report = await validateProject(ctx.cwd, ctx.config);

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    if (report.diagnostics.length === 0) {
      log.success(`${report.entryCount} entries — no problems found.`);
    } else {
      for (const d of report.diagnostics) printDiagnostic(d);
      log.info('');
      const summary = `${report.entryCount} entries · ${report.errorCount} errors · ${report.warningCount} warnings`;
      if (report.ok) log.warn(summary);
      else log.error(summary);
    }
  }

  if (!report.ok) process.exitCode = 1;
  return report.ok;
}
