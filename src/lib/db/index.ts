/**
 * Storage has two backends: a local SQLite file for development, and
 * hosted Postgres for production (Vercel). Which one runs is decided here,
 * by whether a database URL is set — nothing above this file needs to know
 * or care which backend actually answered the call.
 *
 * The Postgres module is only ever imported when a database URL is
 * present, and vice versa for the SQLite module — dynamic import() means
 * the one not in use is never evaluated, so better-sqlite3's native binary
 * is never touched in production and pg never opens a connection locally.
 */
import type { CreatePostInput, DbBackend } from "./types";
import { resolveDatabaseUrl } from "./types";

function getBackend(): Promise<DbBackend> {
  return resolveDatabaseUrl() ? import("./postgres") : import("./sqlite");
}

export async function getAllPosts() {
  return (await getBackend()).getAllPosts();
}

export async function createPost(input: CreatePostInput) {
  return (await getBackend()).createPost(input);
}

export async function removePost(id: string) {
  return (await getBackend()).removePost(id);
}

export type { CreatePostInput, MediaRow, NewMedia, PostRow, PostWithMedia } from "./types";
