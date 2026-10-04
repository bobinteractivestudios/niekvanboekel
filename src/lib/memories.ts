import fs from "fs";
import path from "path";

/**
 * Every shared memory lives in content/memories.json, with its photos and
 * videos under public/memories — no database, no external storage. Sharing
 * via the site is switched off; to add or remove a memory, edit that file
 * (and drop/delete the media file next to it).
 */

export type MemoryMedia = {
  /** Path under /public, e.g. "/memories/xxx.jpg". */
  url: string;
  kind: "image" | "video";
};

export type Memory = {
  author_name: string | null;
  body: string | null;
  created_at: string;
  media: MemoryMedia[];
};

export type PostWithMedia = Omit<Memory, "media"> & {
  id: string;
  media: (MemoryMedia & { id: string })[];
};

const MEMORIES_PATH = path.join(process.cwd(), "content", "memories.json");

/** Every memory, newest first. */
export function getAllPosts(): PostWithMedia[] {
  const memories = JSON.parse(fs.readFileSync(MEMORIES_PATH, "utf-8")) as Memory[];
  return memories
    .map((memory, index) => ({
      ...memory,
      id: `memory-${index}`,
      media: memory.media.map((media) => ({ ...media, id: media.url })),
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
