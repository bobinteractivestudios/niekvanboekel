import fs from "fs";
import path from "path";
import sharp from "sharp";

export type Dimensions = { width: number; height: number };

const DEFAULT_IMAGE: Dimensions = { width: 800, height: 1000 };
const DEFAULT_VIDEO: Dimensions = { width: 1600, height: 900 };

const cache = new Map<string, Dimensions>();

async function measureLocal(publicPath: string): Promise<Dimensions> {
  const filePath = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));

  let mtimeMs: number;
  try {
    mtimeMs = fs.statSync(filePath).mtimeMs;
  } catch {
    return DEFAULT_IMAGE;
  }

  // Keyed by mtime so a replaced file (same path, new content) is re-measured.
  const cacheKey = `local:${publicPath}:${mtimeMs}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  let dimensions = DEFAULT_IMAGE;
  try {
    const metadata = await sharp(filePath).metadata();
    if (metadata.width && metadata.height) {
      // EXIF orientations 5–8 are rotated a quarter turn: the browser shows
      // them with width and height swapped relative to the stored pixels.
      const rotated = (metadata.orientation ?? 1) >= 5;
      dimensions = rotated
        ? { width: metadata.height, height: metadata.width }
        : { width: metadata.width, height: metadata.height };
    }
  } catch {
    // Unreadable or unsupported file — fall back to the default ratio.
  }

  cache.set(cacheKey, dimensions);
  return dimensions;
}

/**
 * Measures an image by its path under /public (the gallery and shared
 * memories, bundled read-only with every deploy). Videos aren't probed — a sensible landscape
 * default is used, only to reserve space in the scatter layout.
 */
export async function getMediaDimensions(
  src: string,
  kind: "image" | "video"
): Promise<Dimensions> {
  if (kind === "video") return DEFAULT_VIDEO;
  return measureLocal(src);
}
