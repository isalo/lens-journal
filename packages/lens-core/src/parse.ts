import path from 'node:path';
import { parse as parseYaml } from 'yaml';

import type { JournalEntry, ResolvedLensConfig } from './types.js';
import { journalEntrySchema } from './types.js';
import { findEntryFiles, readText } from './fs.js';

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export interface ParsedEntryResult {
  entry?: JournalEntry;
  /** Present when frontmatter could not be parsed/validated. */
  error?: { filePath: string; message: string };
}

/** Split a raw MDX file into its frontmatter object and markdown body. */
export function splitFrontmatter(raw: string): {
  data: unknown;
  body: string;
} {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) return { data: {}, body: raw };
  const [, yaml, body] = match;
  return { data: parseYaml(yaml ?? '') ?? {}, body: body ?? '' };
}

function slugFromPath(contentDir: string, filePath: string): string {
  const rel = path.relative(contentDir, filePath);
  const dir = path.dirname(rel);
  const base = path.basename(rel, path.extname(rel));
  // Folder-style entries (slug/index.mdx) use the folder name.
  if (base === 'index' && dir !== '.') return dir.split(path.sep).join('/');
  return rel.replace(/\.[^.]+$/, '').split(path.sep).join('/');
}

/** Parse and validate a single entry file. */
export async function parseEntryFile(
  contentDir: string,
  filePath: string,
): Promise<ParsedEntryResult> {
  try {
    const raw = await readText(filePath);
    const { data, body } = splitFrontmatter(raw);
    const result = journalEntrySchema.safeParse(data);
    if (!result.success) {
      return {
        error: {
          filePath,
          message: result.error.issues
            .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
            .join('; '),
        },
      };
    }
    const slug = result.data.slug ?? slugFromPath(contentDir, filePath);
    return {
      entry: { filePath, slug, frontmatter: result.data, body },
    };
  } catch (err) {
    return {
      error: { filePath, message: (err as Error).message },
    };
  }
}

export interface LoadEntriesResult {
  entries: JournalEntry[];
  errors: { filePath: string; message: string }[];
}

/** Load and validate all journal entries within the configured content dir. */
export async function loadEntries(
  cwd: string,
  config: ResolvedLensConfig,
): Promise<LoadEntriesResult> {
  const contentDir = path.join(cwd, config.contentDir);
  const files = await findEntryFiles(contentDir);
  const entries: JournalEntry[] = [];
  const errors: { filePath: string; message: string }[] = [];

  for (const file of files) {
    const { entry, error } = await parseEntryFile(contentDir, file);
    if (entry) entries.push(entry);
    if (error) errors.push(error);
  }

  return { entries, errors };
}
