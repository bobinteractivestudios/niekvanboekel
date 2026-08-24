"use server";

import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";
import { saveUploadedFile, UploadError, MAX_FILES_PER_POST, type SavedFile } from "@/lib/uploads";

export type SubmitState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const MAX_BODY_LENGTH = 4000;
const MAX_NAME_LENGTH = 80;

export async function submitMemory(
  _prevState: SubmitState,
  formData: FormData
): Promise<SubmitState> {
  const authorNameRaw = String(formData.get("authorName") ?? "").trim();
  const bodyRaw = String(formData.get("body") ?? "").trim();
  const files = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  const authorName = authorNameRaw.slice(0, MAX_NAME_LENGTH);
  const body = bodyRaw.slice(0, MAX_BODY_LENGTH);

  if (!body && files.length === 0) {
    return {
      status: "error",
      message: "Voeg een tekstje toe, of minimaal één foto of video.",
    };
  }

  if (files.length > MAX_FILES_PER_POST) {
    return {
      status: "error",
      message: `Je kan maximaal ${MAX_FILES_PER_POST} bestanden per keer delen.`,
    };
  }

  const db = getDb();
  const postId = randomUUID();
  const now = new Date().toISOString();

  try {
    const savedFiles: SavedFile[] = [];
    for (const file of files) {
      savedFiles.push(await saveUploadedFile(file));
    }

    const insertPost = db.prepare(
      `INSERT INTO posts (id, author_name, body, status, created_at)
       VALUES (?, ?, ?, 'pending', ?)`
    );
    const insertMedia = db.prepare(
      `INSERT INTO media (id, post_id, file_name, mime_type, kind, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    );

    const transaction = db.transaction(() => {
      insertPost.run(postId, authorName || null, body || null, now);
      for (const saved of savedFiles) {
        insertMedia.run(
          randomUUID(),
          postId,
          saved.fileName,
          saved.mimeType,
          saved.kind,
          now
        );
      }
    });
    transaction();
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
    message:
      "Bedankt voor het delen. Je herinnering wordt eerst bekeken voordat die zichtbaar wordt op de pagina.",
  };
}
