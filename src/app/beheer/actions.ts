"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { deleteUploadedFile } from "@/lib/uploads";
import { checkPassword, createSession, destroySession, isAuthenticated } from "@/lib/auth";

export type LoginState = { error?: string };

async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new Error("Niet geautoriseerd.");
  }
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    return { error: "Onjuist wachtwoord." };
  }
  await createSession();
  redirect("/beheer");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/beheer");
}

export async function approvePost(id: string): Promise<void> {
  await requireAuth();
  const db = getDb();
  db.prepare("UPDATE posts SET status = 'approved', reviewed_at = ? WHERE id = ?").run(
    new Date().toISOString(),
    id
  );
  revalidatePath("/beheer");
  revalidatePath("/");
}

export async function rejectPost(id: string): Promise<void> {
  await requireAuth();
  const db = getDb();
  db.prepare("UPDATE posts SET status = 'rejected', reviewed_at = ? WHERE id = ?").run(
    new Date().toISOString(),
    id
  );
  revalidatePath("/beheer");
  revalidatePath("/");
}

export async function deletePost(id: string): Promise<void> {
  await requireAuth();
  const db = getDb();
  const media = db
    .prepare("SELECT file_name FROM media WHERE post_id = ?")
    .all(id) as { file_name: string }[];
  for (const item of media) {
    deleteUploadedFile(item.file_name);
  }
  db.prepare("DELETE FROM posts WHERE id = ?").run(id);
  revalidatePath("/beheer");
  revalidatePath("/");
}
