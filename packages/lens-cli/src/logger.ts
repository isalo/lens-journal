import pc from 'picocolors';

let verbose = false;

export function setVerbose(value: boolean): void {
  verbose = value;
}

export const log = {
  info: (msg: string) => console.log(msg),
  success: (msg: string) => console.log(`${pc.green('✓')} ${msg}`),
  warn: (msg: string) => console.warn(`${pc.yellow('⚠')} ${msg}`),
  error: (msg: string) => console.error(`${pc.red('✗')} ${msg}`),
  step: (msg: string) => console.log(`${pc.cyan('›')} ${msg}`),
  dim: (msg: string) => console.log(pc.dim(msg)),
  debug: (msg: string) => {
    if (verbose) console.log(pc.dim(`[debug] ${msg}`));
  },
};

export { pc };

export function title(text: string): void {
  console.log(`\n${pc.bold(pc.magenta('lens'))} ${pc.bold(text)}`);
}
