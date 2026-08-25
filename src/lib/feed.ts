import type { PostWithMedia } from "@/lib/db";
import type { GalleryImage } from "@/lib/gallery";

export type FeedItem =
  | { type: "post"; id: string; timestamp: number; post: PostWithMedia }
  | { type: "photo"; id: string; timestamp: number; src: string; kind: "image" | "video" };

export function buildFeedItems(
  posts: PostWithMedia[],
  galleryImages: GalleryImage[]
): FeedItem[] {
  const items: FeedItem[] = [];

  for (const image of galleryImages) {
    items.push({
      type: "photo",
      id: image.src,
      timestamp: image.mtime,
      src: image.src,
      kind: "image",
    });
  }

  for (const post of posts) {
    const timestamp = new Date(post.created_at).getTime();
    const hasText = Boolean(post.body && post.body.trim().length > 0);

    if (hasText) {
      items.push({ type: "post", id: post.id, timestamp, post });
    } else {
      // Text-free submissions render as loose photos/videos rather than a card.
      for (const media of post.media) {
        items.push({
          type: "photo",
          id: media.id,
          timestamp,
          src: media.url,
          kind: media.kind,
        });
      }
    }
  }

  return items.sort((a, b) => b.timestamp - a.timestamp);
}
