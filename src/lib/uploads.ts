import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { put, del } from "@vercel/blob";
import { ALLOWED_TYPES, MAX_FILE_BYTES, extensionFor } from "@/lib/uploadShared";

export { MAX_FILES_PER_POST } from "@/lib/uploadShared";

export type SavedFile = {
  url: string;
  mimeType: string;
  kind: "image" | "video";
};

export class UploadError extends Error {}

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
 * Vercel Blob is available either via a static BLOB_READ_WRITE_TOKEN, or
 * (the current default when a Blob store is attached from the dashboard)
 * via BLOB_STORE_ID plus an OIDC token Vercel injects automatically at
 * runtime — the @vercel/blob SDK picks whichever is present on its own.
 * We only need to know whether Blob is configured at all: to choose it
 * over the local-disk fallback here, and (see /deel/page.tsx) to tell the
 * client whether to upload straight to Blob instead of routing file bytes
 * through a server action, which Vercel caps at ~4.5MB per request.
 */
export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

/**
 * Saves to Vercel Blob when configured (production), otherwise to
 * public/uploads on local disk (development). Only used for the local-dev
 * path and any file that, for whatever reason, didn't go through the
 * client's direct-to-Blob upload — see components/UploadForm.tsx.
 */
export async function saveUploadedFile(file: File): Promise<SavedFile> {
  const kind = validate(file);
  const fileName = `${randomUUID()}.${extensionFor(file.type)}`;

  if (isBlobConfigured()) {
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
