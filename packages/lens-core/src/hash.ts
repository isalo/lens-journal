import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';

/** Compute the SHA-256 hash of a buffer (hex). */
export function hashBuffer(buffer: Buffer | Uint8Array): string {
  return createHash('sha256').update(buffer).digest('hex');
}

/**
 * Compute the SHA-256 hash of a file on disk (hex), streaming the contents so
 * large images don't have to be held in memory.
 */
export function hashFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);
    stream.on('error', reject);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}
