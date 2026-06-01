import path from 'node:path';
import ora from 'ora';
import { importPhotos, pathExists, type EntryStatus } from '@lens-journal/core';

import { createContext, type GlobalOptions } from '../context.js';
import { log, pc, title } from '../logger.js';

export interface NewOptions extends GlobalOptions {
  status?: EntryStatus;
  title?: string;
  slug?: string;
  force?: boolean;
}

/** `lens new <photo>` — import a single photo and create a draft entry. */
export async function newCommand(
  photo: string,
  options: NewOptions,
): Promise<void> {
  const ctx = await createContext(options);
  const source = path.resolve(ctx.cwd, photo);

  if (!(await pathExists(source))) {
    log.error(`Photo not found: ${pc.bold(photo)}`);
    process.exitCode = 1;
    return;
  }

  title(`new ${pc.dim(path.basename(source))}`);
  const spinner = ora('Reading EXIF and importing…').start();

  try {
    const result = await importPhotos(ctx.cwd, ctx.config, [source], {
      groupBy: 'none',
      force: options.force,
      status: options.status,
      title: options.title,
      slug: options.slug,
    });
    spinner.stop();

    if (result.duplicateCount > 0) {
      log.warn(
        `Already imported (duplicate hash). Use ${pc.bold('--force')} to re-import.`,
      );
      return;
    }

    const errored = result.items.find((i) => i.status === 'error');
    if (errored) {
      log.error(errored.error ?? 'Import failed.');
      process.exitCode = 1;
      return;
    }

    const photoItem = result.items.find((i) => i.status === 'imported');
    const entry = result.entries[0];
    if (photoItem?.publicPath) {
      log.success(`Copied photo → ${pc.cyan(photoItem.publicPath)}`);
    }
    if (entry) {
      log.success(
        `Created draft entry → ${pc.cyan(path.relative(ctx.cwd, entry.filePath))}`,
      );
      log.dim(`  slug: ${entry.slug}`);
    }
    log.info(`\nNext: edit the entry, then run ${pc.bold('lens validate')}.`);
  } catch (err) {
    spinner.stop();
    log.error((err as Error).message);
    process.exitCode = 1;
  }
}
