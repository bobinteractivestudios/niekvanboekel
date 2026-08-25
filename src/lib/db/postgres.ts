/**
 * Production backend: hosted Postgres, used whenever a database URL is set
 * (i.e. on Vercel, once a Postgres storage integration is attached) — see
 * types.ts for the exact env var names checked, and index.ts for how the
 * backend gets picked.
 */
import { Pool } from "pg";
import { randomUUID } from "crypto";
import type { CreatePostInput, MediaRow, PostRow, PostWithMedia } from "./types";
import { resolveDatabaseUrl } from "./types";

declare global {
  var __memorialPgPool: Pool | undefined;
  var __memorialPgSchema: Promise<void> | undefined;
}

function getPool(): Pool {
  if (!global.__memorialPgPool) {
    global.__memorialPgPool = new Pool({
      connectionString: resolveDatabaseUrl(),
      ssl: { rejectUnauthorized: false },
      max: 3,
    });
  }
  return global.__memorialPgPool;
}

function ensureSchema(): Promise<void> {
  if (!global.__memorialPgSchema) {
    // status/reviewed_at are unused leftovers from an earlier moderation
    // queue — kept in the schema so an already-live database doesn't need
    // a migration, but nothing reads or writes them meaningfully any more.
    global.__memorialPgSchema = getPool()
      .query(
        `
        CREATE TABLE IF NOT EXISTS posts (
          id TEXT PRIMARY KEY,
          author_name TEXT,
          body TEXT,
          status TEXT NOT NULL DEFAULT 'approved',
          created_at TEXT NOT NULL,
          reviewed_at TEXT
        );

        CREATE TABLE IF NOT EXISTS media (
          id TEXT PRIMARY KEY,
          post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
          url TEXT NOT NULL,
          mime_type TEXT NOT NULL,
          kind TEXT NOT NULL,
          created_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_media_post_id ON media(post_id);
        `
      )
      .then(() => undefined);
  }
  return global.__memorialPgSchema;
}

export async function getAllPosts(): Promise<PostWithMedia[]> {
  await ensureSchema();
  const pool = getPool();
  const { rows: posts } = await pool.query<PostRow>(
    `SELECT id, author_name, body, created_at FROM posts ORDER BY created_at DESC`
  );
  if (posts.length === 0) return [];

  const { rows: media } = await pool.query<MediaRow>(
    `SELECT * FROM media WHERE post_id = ANY($1) ORDER BY created_at ASC`,
    [posts.map((post) => post.id)]
  );
  const byPost = new Map<string, MediaRow[]>();
  for (const row of media) {
    const list = byPost.get(row.post_id) ?? [];
    list.push(row);
    byPost.set(row.post_id, list);
  }
  return posts.map((post) => ({ ...post, media: byPost.get(post.id) ?? [] }));
}

export async function createPost(input: CreatePostInput): Promise<void> {
  await ensureSchema();
  const pool = getPool();
  const client = await pool.connect();
  const postId = randomUUID();
  const now = new Date().toISOString();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO posts (id, author_name, body, created_at) VALUES ($1, $2, $3, $4)`,
      [postId, input.authorName, input.body, now]
    );
    for (const media of input.media) {
      await client.query(
        `INSERT INTO media (id, post_id, url, mime_type, kind, created_at) VALUES ($1, $2, $3, $4, $5, $6)`,
        [randomUUID(), postId, media.url, media.mimeType, media.kind, now]
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function removePost(id: string): Promise<MediaRow[]> {
  await ensureSchema();
  const pool = getPool();
  const { rows } = await pool.query<MediaRow>(`SELECT * FROM media WHERE post_id = $1`, [id]);
  await pool.query(`DELETE FROM posts WHERE id = $1`, [id]);
  return rows;
}
