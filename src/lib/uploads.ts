import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const ALLOWED_TYPES: Record<string, "image" | "video"> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
  "image/heic": "image",
  "video/mp4": "video",
  "video/quicktime": "video",
  "video/webm": "video",
};

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50MB
export const MAX_FILES_PER_POST = 6;

export type SavedFile = {
  fileName: string;
  mimeType: string;
  kind: "image" | "video";
};

export class UploadError extends Error {}

function extensionFor(mimeType: string): string {
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

export async function saveUploadedFile(file: File): Promise<SavedFile> {
  const kind = ALLOWED_TYPES[file.type];
  if (!kind) {
    throw new UploadError(`Bestandstype niet ondersteund: ${file.type || "onbekend"}`);
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new UploadError(`Bestand is te groot (max ${MAX_FILE_BYTES / (1024 * 1024)}MB): ${file.name}`);
  }

  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const fileName = `${randomUUID()}.${extensionFor(file.type)}`;
  const destination = path.join(UPLOAD_DIR, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.promises.writeFile(destination, buffer);

  return { fileName, mimeType: file.type, kind };
}

export function deleteUploadedFile(fileName: string): void {
  const target = path.join(UPLOAD_DIR, fileName);
  if (fs.existsSync(target)) {
    fs.unlinkSync(target);
  }
}
