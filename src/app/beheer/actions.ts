"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { setPostStatus, removePost } from "@/lib/db";
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
  await setPostStatus(id, "approved");
  revalidatePath("/beheer");
  revalidatePath("/");
}

export async function rejectPost(id: string): Promise<void> {
  await requireAuth();
  await setPostStatus(id, "rejected");
  revalidatePath("/beheer");
  revalidatePath("/");
}

export async function deletePost(id: string): Promise<void> {
  await requireAuth();
  const media = await removePost(id);
  for (const item of media) {
    await deleteUploadedFile(item.url);
  }
  revalidatePath("/beheer");
  revalidatePath("/");
}
