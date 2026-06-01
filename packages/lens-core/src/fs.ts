import path from 'node:path';
import fse from 'fs-extra';
import fg from 'fast-glob';

import { SUPPORTED_IMAGE_EXTENSIONS } from './types.js';

/** Ensure a directory exists (recursively). */
export async function ensureDir(dir: string): Promise<void> {
  await fse.ensureDir(dir);
}

/** True when a path exists on disk. */
export async function pathExists(p: string): Promise<boolean> {
  return fse.pathExists(p);
}

/** Copy a file, creating parent directories as needed. */
export async function copyFile(src: string, dest: string): Promise<void> {
  await fse.ensureDir(path.dirname(dest));
  await fse.copy(src, dest, { overwrite: true });
}

/** Read a UTF-8 text file. */
export async function readText(p: string): Promise<string> {
  return fse.readFile(p, 'utf8');
}

/** Write a UTF-8 text file, creating parent directories as needed. */
export async function writeText(p: string, contents: string): Promise<void> {
  await fse.ensureDir(path.dirname(p));
  await fse.writeFile(p, contents, 'utf8');
}

/** Read a JSON file, returning `fallback` if it does not exist. */
export async function readJson<T>(p: string, fallback: T): Promise<T> {
  try {
    return (await fse.readJson(p)) as T;
  } catch {
    return fallback;
  }
}

/** Write a JSON file (pretty-printed), creating parent directories. */
export async function writeJson(p: string, data: unknown): Promise<void> {
  await fse.ensureDir(path.dirname(p));
  await fse.writeJson(p, data, { spaces: 2 });
}

/** True when a file has a supported image extension. */
export function isSupportedImage(file: string): boolean {
  const ext = path.extname(file).slice(1).toLowerCase();
  return (SUPPORTED_IMAGE_EXTENSIONS as readonly string[]).includes(ext);
}

/**
 * Recursively find supported image files within a directory.
 * Returns absolute paths, sorted.
 */
export async function findImages(dir: string): Promise<string[]> {
  const patterns = SUPPORTED_IMAGE_EXTENSIONS.map((ext) => `**/*.${ext}`);
  const matches = await fg(patterns, {
    cwd: dir,
    absolute: true,
    caseSensitiveMatch: false,
    onlyFiles: true,
    dot: false,
  });
  return matches.sort();
}

/**
 * Recursively find journal entry files (`.md` / `.mdx`) within a directory.
 * Returns absolute paths, sorted.
 */
export async function findEntryFiles(dir: string): Promise<string[]> {
  if (!(await pathExists(dir))) return [];
  const matches = await fg(['**/*.md', '**/*.mdx'], {
    cwd: dir,
    absolute: true,
    onlyFiles: true,
    dot: false,
  });
  return matches.sort();
}
