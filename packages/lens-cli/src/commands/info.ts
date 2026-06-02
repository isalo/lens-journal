import { findImages, loadEntries, loadPhotoCache } from '@lens-journal/core';

import { createContext, type GlobalOptions } from '../context.js';
import { log, pc, title } from '../logger.js';

/** `lens info` — print resolved config and project stats. */
export async function infoCommand(options: GlobalOptions): Promise<void> {
  const ctx = await createContext(options);

  const [{ entries }, cache] = await Promise.all([
    loadEntries(ctx.cwd, ctx.config),
    loadPhotoCache(ctx.cwd),
  ]);
  const photoFiles = await findImages(
    `${ctx.cwd}/${ctx.config.photosDir}`,
  ).catch(() => []);

  const published = entries.filter(
    (e) => e.frontmatter.status === 'published',
  ).length;

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          cwd: ctx.cwd,
          configPath: ctx.configPath,
          config: ctx.config,
          stats: {
            entries: entries.length,
            published,
            drafts: entries.length - published,
            photos: photoFiles.length,
            cached: Object.keys(cache.photos).length,
          },
        },
        null,
        2,
      ),
    );
    return;
  }

  title('info');
  log.dim(`cwd          ${ctx.cwd}`);
  log.dim(`config       ${ctx.configPath ?? '(defaults)'}`);
  log.info('');
  log.step(`Config`);
  for (const [key, value] of Object.entries(ctx.config)) {
    console.log(`  ${pc.cyan(key.padEnd(24))} ${String(value)}`);
  }
  log.info('');
  log.step('Project');
  console.log(`  ${pc.cyan('entries'.padEnd(24))} ${entries.length}`);
  console.log(`  ${pc.cyan('published'.padEnd(24))} ${published}`);
  console.log(
    `  ${pc.cyan('drafts'.padEnd(24))} ${entries.length - published}`,
  );
  console.log(`  ${pc.cyan('photos on disk'.padEnd(24))} ${photoFiles.length}`);
  console.log(
    `  ${pc.cyan('photos cached'.padEnd(24))} ${Object.keys(cache.photos).length}`,
  );
}
