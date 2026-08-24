import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "memorial.db");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

declare global {
  var __memorialDb: Database.Database | undefined;
}

function createConnection(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      author_name TEXT,
      body TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      reviewed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      kind TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
    CREATE INDEX IF NOT EXISTS idx_media_post_id ON media(post_id);
  `);

  return db;
}

export function getDb(): Database.Database {
  if (!global.__memorialDb) {
    global.__memorialDb = createConnection();
  }
  return global.__memorialDb;
}

export type PostStatus = "pending" | "approved" | "rejected";

export type MediaRow = {
  id: string;
  post_id: string;
  file_name: string;
  mime_type: string;
  kind: "image" | "video";
  created_at: string;
};

export type PostRow = {
  id: string;
  author_name: string | null;
  body: string | null;
  status: PostStatus;
  created_at: string;
  reviewed_at: string | null;
};

export type PostWithMedia = PostRow & { media: MediaRow[] };

function attachMedia(db: Database.Database, posts: PostRow[]): PostWithMedia[] {
  if (posts.length === 0) return [];
  const mediaStmt = db.prepare<[string]>(
    "SELECT * FROM media WHERE post_id = ? ORDER BY created_at ASC"
  );
  return posts.map((post) => ({
    ...post,
    media: mediaStmt.all(post.id) as MediaRow[],
  }));
}

export function getApprovedPosts(): PostWithMedia[] {
  const db = getDb();
  const posts = db
    .prepare("SELECT * FROM posts WHERE status = 'approved' ORDER BY created_at DESC")
    .all() as PostRow[];
  return attachMedia(db, posts);
}

export function getPendingPosts(): PostWithMedia[] {
  const db = getDb();
  const posts = db
    .prepare("SELECT * FROM posts WHERE status = 'pending' ORDER BY created_at ASC")
    .all() as PostRow[];
  return attachMedia(db, posts);
}

export function getReviewedPosts(): PostWithMedia[] {
  const db = getDb();
  const posts = db
    .prepare(
      "SELECT * FROM posts WHERE status IN ('approved', 'rejected') ORDER BY reviewed_at DESC"
    )
    .all() as PostRow[];
  return attachMedia(db, posts);
}
