import fs from "fs";
import path from "path";
import sharp from "sharp";

export type Dimensions = { width: number; height: number };

const DEFAULT_IMAGE: Dimensions = { width: 800, height: 1000 };
const DEFAULT_VIDEO: Dimensions = { width: 1600, height: 900 };

// Keyed by "<publicPath>:<mtimeMs>" so a replaced file is measured again.
const cache = new Map<string, Dimensions>();

/**
 * Measures a file living under /public. Videos are not probed — they get a
 * sensible landscape default, which is only used to reserve space in the
 * scatter layout.
 */
export async function getMediaDimensions(
  publicPath: string,
  kind: "image" | "video"
): Promise<Dimensions> {
  if (kind === "video") return DEFAULT_VIDEO;

  const filePath = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));

  let mtimeMs: number;
  try {
    mtimeMs = fs.statSync(filePath).mtimeMs;
  } catch {
    return DEFAULT_IMAGE;
  }

  const cacheKey = `${publicPath}:${mtimeMs}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  let dimensions = DEFAULT_IMAGE;
  try {
    const metadata = await sharp(filePath).metadata();
    if (metadata.width && metadata.height) {
      dimensions = { width: metadata.width, height: metadata.height };
    }
  } catch {
    // Unreadable or unsupported file — fall back to the default ratio.
  }

  cache.set(cacheKey, dimensions);
  return dimensions;
}
