/**
 * Local development backend: a SQLite file on disk. Used whenever no
 * database URL is set — see index.ts for how the backend is picked.
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { CreatePostInput, MediaRow, PostRow, PostWithMedia } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "memorial.db");

declare global {
  var __memorialSqliteDb: Database.Database | undefined;
}

function ensureSchema(db: Database.Database): void {
  // status/reviewed_at are unused leftovers from an earlier moderation
  // queue — kept in the schema so existing local databases don't need a
  // migration, but nothing reads or writes them meaningfully any more.
  db.exec(`
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
  `);

  // Migrate databases created before media.url was renamed from file_name.
  const columns = db.prepare("PRAGMA table_info(media)").all() as { name: string }[];
  const hasFileName = columns.some((c) => c.name === "file_name");
  const hasUrl = columns.some((c) => c.name === "url");
  if (hasFileName && !hasUrl) {
    db.exec("ALTER TABLE media RENAME COLUMN file_name TO url");
    db.prepare(
      "UPDATE media SET url = '/uploads/' || url WHERE url NOT LIKE '/%' AND url NOT LIKE 'http%'"
    ).run();
  }

  db.exec(`CREATE INDEX IF NOT EXISTS idx_media_post_id ON media(post_id)`);
}

function getDb(): Database.Database {
  if (!global.__memorialSqliteDb) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    ensureSchema(db);
    global.__memorialSqliteDb = db;
  }
  return global.__memorialSqliteDb;
}

export async function getAllPosts(): Promise<PostWithMedia[]> {
  const db = getDb();
  const posts = db
    .prepare("SELECT id, author_name, body, created_at FROM posts ORDER BY created_at DESC")
    .all() as PostRow[];
  if (posts.length === 0) return [];
  const mediaStmt = db.prepare<[string]>("SELECT * FROM media WHERE post_id = ? ORDER BY created_at ASC");
  return posts.map((post) => ({
    ...post,
    media: mediaStmt.all(post.id) as MediaRow[],
  }));
}

export async function createPost(input: CreatePostInput): Promise<void> {
  const db = getDb();
  const postId = randomUUID();
  const now = new Date().toISOString();

  const insertPost = db.prepare(
    `INSERT INTO posts (id, author_name, body, created_at) VALUES (?, ?, ?, ?)`
  );
  const insertMedia = db.prepare(
    `INSERT INTO media (id, post_id, url, mime_type, kind, created_at) VALUES (?, ?, ?, ?, ?, ?)`
  );

  const transaction = db.transaction(() => {
    insertPost.run(postId, input.authorName, input.body, now);
    for (const media of input.media) {
      insertMedia.run(randomUUID(), postId, media.url, media.mimeType, media.kind, now);
    }
  });
  transaction();
}

export async function removePost(id: string): Promise<MediaRow[]> {
  const db = getDb();
  const media = db.prepare("SELECT * FROM media WHERE post_id = ?").all(id) as MediaRow[];
  db.prepare("DELETE FROM posts WHERE id = ?").run(id);
  return media;
}
