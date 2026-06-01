import sharp from 'sharp';

export interface ImageSize {
  width?: number;
  height?: number;
}

/**
 * Read pixel dimensions from an image using Sharp. Returns an empty object if
 * the file cannot be read so callers can degrade gracefully.
 */
export async function getImageSize(filePath: string): Promise<ImageSize> {
  try {
    const meta = await sharp(filePath).metadata();
    return { width: meta.width, height: meta.height };
  } catch {
    return {};
  }
}
