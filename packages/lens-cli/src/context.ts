import path from 'node:path';
import { loadConfig, type ResolvedLensConfig } from '@lens-journal/core';

export interface GlobalOptions {
  cwd?: string;
  config?: string;
  json?: boolean;
  verbose?: boolean;
}

export interface CliContext {
  cwd: string;
  config: ResolvedLensConfig;
  configPath: string | null;
}

/** Resolve the working directory and load the project's Lens config. */
export async function createContext(
  options: GlobalOptions,
): Promise<CliContext> {
  const cwd = options.cwd ? path.resolve(options.cwd) : process.cwd();
  const { config, filepath } = await loadConfig(cwd);
  return { cwd, config, configPath: filepath };
}
