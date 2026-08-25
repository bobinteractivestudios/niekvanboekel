export type PostStatus = "pending" | "approved" | "rejected";

export type MediaRow = {
  id: string;
  post_id: string;
  /** Absolute URL: "/uploads/xxx.jpg" locally, a Vercel Blob URL in production. */
  url: string;
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

export type NewMedia = { url: string; mimeType: string; kind: "image" | "video" };

export type CreatePostInput = {
  authorName: string | null;
  body: string | null;
  media: NewMedia[];
};

/** Implemented by both the local (SQLite) and production (Postgres) backends — see index.ts for how one gets picked. */
export interface DbBackend {
  getApprovedPosts(): Promise<PostWithMedia[]>;
  getPendingPosts(): Promise<PostWithMedia[]>;
  getReviewedPosts(): Promise<PostWithMedia[]>;
  createPost(input: CreatePostInput): Promise<void>;
  setPostStatus(id: string, status: "approved" | "rejected"): Promise<void>;
  /** Deletes the post and its media rows, returning the media that was attached so the caller can delete the actual files/blobs. */
  removePost(id: string): Promise<MediaRow[]>;
}
