import { Command, Option } from 'commander';

import { setVerbose } from './logger.js';
import { newCommand } from './commands/new.js';
import { importCommand } from './commands/import.js';
import { validateCommand } from './commands/validate.js';
import { infoCommand } from './commands/info.js';
import { devCommand } from './commands/dev.js';
import { buildCommand } from './commands/build.js';

const program = new Command();

program
  .name('lens')
  .description('Lens Journal — EXIF-aware photo journal toolkit')
  .version('0.1.0')
  .option('--cwd <dir>', 'run as if lens was started in <dir>')
  .option('--config <path>', 'path to a lens.config file')
  .option('--json', 'output machine-readable JSON where supported')
  .option('-v, --verbose', 'verbose logging')
  .hook('preAction', (thisCommand) => {
    setVerbose(Boolean(thisCommand.opts().verbose));
  });

/** Merge global options (parsed on the root) into each command's options. */
function withGlobals<T extends object>(_command: Command, options: T): T {
  return { ...program.opts(), ...options };
}

program
  .command('new')
  .description('import a single photo and create a draft entry')
  .argument('<photo>', 'path to the photo to import')
  .addOption(
    new Option('--status <status>', 'entry status').choices([
      'draft',
      'published',
    ]),
  )
  .option('--title <title>', 'override the generated entry title')
  .option('--slug <slug>', 'override the generated slug')
  .option('--force', 're-import even if the photo was already imported')
  .action((photo, options, command) =>
    newCommand(photo, withGlobals(command, options)),
  );

program
  .command('import')
  .description('recursively import a folder of photos')
  .argument('<folder>', 'folder of photos to import')
  .addOption(
    new Option('--group-by <mode>', 'how to group photos into entries')
      .choices(['none', 'date', 'location'])
      .default('date'),
  )
  .addOption(
    new Option('--status <status>', 'entry status').choices([
      'draft',
      'published',
    ]),
  )
  .option('--force', 're-import duplicates')
  .action((folder, options, command) =>
    importCommand(folder, {
      ...withGlobals(command, options),
      groupBy: options.groupBy,
    }),
  );

program
  .command('validate')
  .description('check content integrity (frontmatter, photos, slugs, GPS)')
  .action(async (options, command) => {
    await validateCommand(withGlobals(command, options));
  });

program
  .command('info')
  .description('print resolved config and project stats')
  .action((options, command) => infoCommand(withGlobals(command, options)));

program
  .command('dev')
  .description('start the Astro dev server')
  .option('--port <port>', 'port to run the dev server on')
  .action((options, command) => devCommand(withGlobals(command, options)));

program
  .command('build')
  .description('validate content and build the static site')
  .option('--skip-validate', 'skip pre-build validation')
  .action((options, command) => buildCommand(withGlobals(command, options)));

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
