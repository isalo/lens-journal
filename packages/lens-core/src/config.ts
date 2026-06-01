import path from 'node:path';
import { createJiti } from 'jiti';

import {
  lensConfigSchema,
  type LensConfig,
  type ResolvedLensConfig,
} from './types.js';
import { pathExists } from './fs.js';

const CONFIG_FILENAMES = [
  'lens.config.ts',
  'lens.config.mjs',
  'lens.config.js',
];

/** Identity helper for type-safe `lens.config.ts` files. */
export function defineConfig(config: LensConfig): LensConfig {
  return config;
}

/** Apply defaults to a (possibly partial) user config. */
export function resolveConfig(config: LensConfig = {}): ResolvedLensConfig {
  return lensConfigSchema.parse(config);
}

/** Find the path to a config file within `cwd`, if one exists. */
export async function findConfigFile(
  cwd: string = process.cwd(),
): Promise<string | null> {
  for (const name of CONFIG_FILENAMES) {
    const candidate = path.join(cwd, name);
    if (await pathExists(candidate)) return candidate;
  }
  return null;
}

export interface LoadConfigResult {
  config: ResolvedLensConfig;
  /** Absolute path to the loaded config file, or null when defaults are used. */
  filepath: string | null;
}

/**
 * Load and resolve a Lens Journal config from `cwd`.
 *
 * Supports `lens.config.ts` / `.mjs` / `.js` via jiti (so TypeScript works
 * without a build step). Falls back to defaults when no config file is found.
 */
export async function loadConfig(
  cwd: string = process.cwd(),
): Promise<LoadConfigResult> {
  const filepath = await findConfigFile(cwd);
  if (!filepath) {
    return { config: resolveConfig({}), filepath: null };
  }

  const jiti = createJiti(cwd, { interopDefault: true });
  const loaded = (await jiti.import(filepath, {
    default: true,
  })) as LensConfig | { default?: LensConfig };

  const raw =
    loaded && typeof loaded === 'object' && 'default' in loaded
      ? ((loaded.default ?? {}) as LensConfig)
      : (loaded as LensConfig);

  return { config: resolveConfig(raw ?? {}), filepath };
}
