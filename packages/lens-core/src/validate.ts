import path from 'node:path';

import type {
  Diagnostic,
  JournalEntry,
  ResolvedLensConfig,
} from './types.js';
import { SUPPORTED_IMAGE_EXTENSIONS } from './types.js';
import { loadEntries } from './parse.js';
import { pathExists } from './fs.js';
import { hasValidLocation } from './geo.js';

/** Resolve the on-disk location of a public photo path. */
function resolvePublicFile(
  cwd: string,
  config: ResolvedLensConfig,
  publicPath: string,
): string {
  const normalized = config.photosDir.replace(/\\/g, '/');
  const staticRoot =
    normalized === 'public' || normalized.startsWith('public/')
      ? path.join(cwd, 'public')
      : cwd;
  return path.join(staticRoot, publicPath.replace(/^\//, ''));
}

function isSupportedExt(p: string): boolean {
  const ext = path.extname(p).slice(1).toLowerCase();
  return (SUPPORTED_IMAGE_EXTENSIONS as readonly string[]).includes(ext);
}

const STRIP_MDX_RE = /(^---[\s\S]*?---)|(<[^>]+>)|[#>*_`~\-!\[\]()]/g;

/** Validate a single already-parsed entry, collecting diagnostics. */
export async function validateEntry(
  cwd: string,
  config: ResolvedLensConfig,
  entry: JournalEntry,
  seenSlugs: Map<string, string>,
): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];
  const { frontmatter: fm, slug } = entry;
  const source = slug;

  if (!fm.title || fm.title.trim().length === 0) {
    diagnostics.push({
      level: 'error',
      code: 'missing-title',
      message: 'Entry is missing a title.',
      source,
    });
  }

  if (Number.isNaN(fm.date?.getTime?.())) {
    diagnostics.push({
      level: 'error',
      code: 'invalid-date',
      message: 'Entry has an invalid date.',
      source,
    });
  }

  // Duplicate slugs.
  const previous = seenSlugs.get(slug);
  if (previous && previous !== entry.filePath) {
    diagnostics.push({
      level: 'error',
      code: 'duplicate-slug',
      message: `Duplicate slug "${slug}" (also used by ${path.basename(previous)}).`,
      source,
    });
  } else {
    seenSlugs.set(slug, entry.filePath);
  }

  // Cover photo.
  if (!fm.coverPhoto) {
    diagnostics.push({
      level: 'warning',
      code: 'missing-cover',
      message: 'Entry has no coverPhoto.',
      source,
    });
  }

  // Photo references + formats.
  const photoRefs = new Set<string>([
    ...(fm.coverPhoto ? [fm.coverPhoto] : []),
    ...fm.photos,
  ]);
  for (const ref of photoRefs) {
    if (!isSupportedExt(ref)) {
      diagnostics.push({
        level: 'error',
        code: 'unsupported-format',
        message: `Unsupported image format: "${ref}".`,
        source,
      });
      continue;
    }
    const onDisk = resolvePublicFile(cwd, config, ref);
    if (!(await pathExists(onDisk))) {
      diagnostics.push({
        level: 'error',
        code: 'broken-photo-ref',
        message: `Photo reference not found on disk: "${ref}".`,
        source,
      });
    }
  }

  // GPS validity (only when present).
  if (fm.gps && !hasValidLocation(fm.gps)) {
    diagnostics.push({
      level: 'error',
      code: 'invalid-gps',
      message: 'Entry has invalid GPS coordinates.',
      source,
    });
  }

  // Story content.
  const story = entry.body.replace(STRIP_MDX_RE, '').trim();
  if (story.length === 0) {
    diagnostics.push({
      level: 'warning',
      code: 'empty-story',
      message: 'Entry has no story content.',
      source,
    });
  }

  return diagnostics;
}

export interface ValidationReport {
  diagnostics: Diagnostic[];
  entryCount: number;
  errorCount: number;
  warningCount: number;
  /** True when there are no error-level diagnostics. */
  ok: boolean;
}

/** Validate every entry in the project and return a full report. */
export async function validateProject(
  cwd: string,
  config: ResolvedLensConfig,
): Promise<ValidationReport> {
  const { entries, errors } = await loadEntries(cwd, config);
  const diagnostics: Diagnostic[] = [];

  // EXIF / frontmatter parse errors surfaced by the loader.
  for (const err of errors) {
    diagnostics.push({
      level: 'error',
      code: 'parse-error',
      message: err.message,
      source: path.basename(err.filePath),
    });
  }

  const seenSlugs = new Map<string, string>();
  for (const entry of entries) {
    diagnostics.push(
      ...(await validateEntry(cwd, config, entry, seenSlugs)),
    );
  }

  const errorCount = diagnostics.filter((d) => d.level === 'error').length;
  const warningCount = diagnostics.filter((d) => d.level === 'warning').length;

  return {
    diagnostics,
    entryCount: entries.length,
    errorCount,
    warningCount,
    ok: errorCount === 0,
  };
}
