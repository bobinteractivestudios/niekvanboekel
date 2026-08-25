import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { put, del } from "@vercel/blob";

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
  url: string;
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

function validate(file: File): "image" | "video" {
  const kind = ALLOWED_TYPES[file.type];
  if (!kind) {
    throw new UploadError(`Bestandstype niet ondersteund: ${file.type || "onbekend"}`);
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new UploadError(`Bestand is te groot (max ${MAX_FILE_BYTES / (1024 * 1024)}MB): ${file.name}`);
  }
  return kind;
}

/**
 * Saves to Vercel Blob when BLOB_READ_WRITE_TOKEN is set (production),
 * otherwise to public/uploads on local disk (development).
 */
export async function saveUploadedFile(file: File): Promise<SavedFile> {
  const kind = validate(file);
  const fileName = `${randomUUID()}.${extensionFor(file.type)}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(fileName, file, { access: "public", contentType: file.type });
    return { url: blob.url, mimeType: file.type, kind };
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const destination = path.join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.promises.writeFile(destination, buffer);

  return { url: `/uploads/${fileName}`, mimeType: file.type, kind };
}

export async function deleteUploadedFile(url: string): Promise<void> {
  if (url.startsWith("http")) {
    await del(url);
    return;
  }
  const target = path.join(process.cwd(), "public", url.replace(/^\//, ""));
  if (fs.existsSync(target)) {
    fs.unlinkSync(target);
  }
}
