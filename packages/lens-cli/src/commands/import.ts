import path from 'node:path';
import ora from 'ora';
import {
  findImages,
  importPhotos,
  pathExists,
  type EntryStatus,
  type GroupBy,
} from '@lens-journal/core';

import { createContext, type GlobalOptions } from '../context.js';
import { log, pc, title } from '../logger.js';

export interface ImportCmdOptions extends GlobalOptions {
  status?: EntryStatus;
  groupBy?: GroupBy;
  force?: boolean;
}

/** `lens import <folder>` — recursively import a folder of photos. */
export async function importCommand(
  folder: string,
  options: ImportCmdOptions,
): Promise<void> {
  const ctx = await createContext(options);
  const dir = path.resolve(ctx.cwd, folder);

  if (!(await pathExists(dir))) {
    log.error(`Folder not found: ${pc.bold(folder)}`);
    process.exitCode = 1;
    return;
  }

  const groupBy = options.groupBy ?? 'date';
  title(`import ${pc.dim(folder)} ${pc.dim(`(group by ${groupBy})`)}`);

  const sources = await findImages(dir);
  if (sources.length === 0) {
    log.warn('No supported images found.');
    return;
  }

  const spinner = ora(`Processing ${sources.length} photos…`).start();
  try {
    const result = await importPhotos(ctx.cwd, ctx.config, sources, {
      groupBy,
      force: options.force,
      status: options.status,
    });
    spinner.stop();

    log.info('');
    log.success(`Imported ${pc.bold(String(result.importedCount))} photos`);
    if (result.duplicateCount > 0) {
      log.warn(`Skipped ${result.duplicateCount} duplicates`);
    }
    if (result.errorCount > 0) {
      log.error(`${result.errorCount} errors`);
      for (const item of result.items.filter((i) => i.status === 'error')) {
        log.dim(`  ${path.basename(item.sourcePath)}: ${item.error}`);
      }
    }
    log.success(`Created ${pc.bold(String(result.entries.length))} entries`);
    for (const entry of result.entries) {
      log.dim(`  ${entry.slug} (${entry.photoCount} photo${entry.photoCount === 1 ? '' : 's'})`);
    }
    log.info(`\nNext: run ${pc.bold('lens validate')} then ${pc.bold('lens dev')}.`);
  } catch (err) {
    spinner.stop();
    log.error((err as Error).message);
    process.exitCode = 1;
  }
}
