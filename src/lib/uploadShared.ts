/**
 * Constants and pure helpers shared between server-only upload code
 * (lib/uploads.ts, the /api/blob-upload route) and the client upload form —
 * this file must stay free of Node built-ins so it can be bundled for the
 * browser.
 */

export const ALLOWED_TYPES: Record<string, "image" | "video"> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
  "image/heic": "image",
  "video/mp4": "video",
  "video/quicktime": "video",
  "video/webm": "video",
};

export const ALLOWED_CONTENT_TYPES = Object.keys(ALLOWED_TYPES);

export const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50MB
export const MAX_FILES_PER_POST = 6;

/** The domain Vercel Blob serves public files from — see next.config.ts's images.remotePatterns. */
export const BLOB_URL_PATTERN = /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\//;

export function kindForType(mimeType: string): "image" | "video" | undefined {
  return ALLOWED_TYPES[mimeType];
}

export function extensionFor(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/heic":
      return "heic";
    case "video/mp4":
      return "mp4";
    case "video/quicktime":
      return "mov";
    case "video/webm":
      return "webm";
    default:
      return "bin";
  }
}
