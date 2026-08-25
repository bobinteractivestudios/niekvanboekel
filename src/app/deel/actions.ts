"use server";

import { createPost } from "@/lib/db";
import { saveUploadedFile, UploadError, MAX_FILES_PER_POST, type SavedFile } from "@/lib/uploads";
import { ALLOWED_TYPES, BLOB_URL_PATTERN } from "@/lib/uploadShared";

export type SubmitState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const MAX_BODY_LENGTH = 4000;
const MAX_NAME_LENGTH = 80;

/**
 * Media the client already uploaded straight to Vercel Blob (see
 * components/UploadForm.tsx) arrives here only as a URL, not the file
 * itself — so unlike a raw File, this is fully client-controlled input and
 * needs its own validation before we trust it enough to store.
 */
function parsePreUploadedMedia(raw: FormDataEntryValue | null): SavedFile[] | null {
  if (typeof raw !== "string" || raw === "") return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;

  const media: SavedFile[] = [];
  for (const item of parsed) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof (item as Record<string, unknown>).url !== "string" ||
      typeof (item as Record<string, unknown>).mimeType !== "string" ||
      !BLOB_URL_PATTERN.test((item as { url: string }).url) ||
      !(ALLOWED_TYPES as Record<string, string>)[(item as { mimeType: string }).mimeType]
    ) {
      return null;
    }
    const mimeType = (item as { mimeType: string }).mimeType;
    media.push({
      url: (item as { url: string }).url,
      mimeType,
      kind: ALLOWED_TYPES[mimeType],
    });
  }
  return media;
}

export async function submitMemory(
  _prevState: SubmitState,
  formData: FormData
): Promise<SubmitState> {
  const authorNameRaw = String(formData.get("authorName") ?? "").trim();
  const bodyRaw = String(formData.get("body") ?? "").trim();
  const rawFiles = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const preUploaded = parsePreUploadedMedia(formData.get("uploadedMedia"));

  const authorName = authorNameRaw.slice(0, MAX_NAME_LENGTH);
  const body = bodyRaw.slice(0, MAX_BODY_LENGTH);

  if (preUploaded === null) {
    return {
      status: "error",
      message: "Er ging iets mis bij het opslaan. Probeer het opnieuw.",
    };
  }

  const totalFiles = rawFiles.length + preUploaded.length;

  if (!body && totalFiles === 0) {
    return {
      status: "error",
      message: "Voeg een tekstje toe, of minimaal één foto of video.",
    };
  }

  if (totalFiles > MAX_FILES_PER_POST) {
    return {
      status: "error",
      message: `Je kan maximaal ${MAX_FILES_PER_POST} bestanden per keer delen.`,
    };
  }

  try {
    const media: SavedFile[] = [...preUploaded];
    for (const file of rawFiles) {
      media.push(await saveUploadedFile(file));
    }
    await createPost({ authorName: authorName || null, body: body || null, media });
  } catch (error) {
    if (error instanceof UploadError) {
      return { status: "error", message: error.message };
    }
    console.error("Kon herinnering niet opslaan:", error);
    return {
      status: "error",
      message: "Er ging iets mis bij het opslaan. Probeer het opnieuw.",
    };
  }

  return {
    status: "success",
    message: "Bedankt voor het delen. Je herinnering staat direct op de pagina.",
  };
}
