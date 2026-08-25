import Image from "next/image";
import type { PostWithMedia } from "@/lib/db";

function formatRelativeDate(iso: string): string {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function MemoryCard({ post }: { post: PostWithMedia }) {
  return (
    <div className="rounded-2xl bg-surface p-5 ring-1 ring-border sm:p-6">
      <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
        {post.body}
      </p>

      {post.media.length > 0 && (
        <div
          className={`mt-4 grid gap-2 ${
            post.media.length === 1 ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          {post.media.map((item) =>
            item.kind === "video" ? (
              <video key={item.id} src={item.url} controls className="w-full rounded-lg" />
            ) : (
              <Image
                key={item.id}
                src={item.url}
                alt=""
                width={400}
                height={400}
                className="w-full h-auto rounded-lg object-cover"
              />
            )
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-muted">
        <span>{post.author_name?.trim() || "Anoniem"}</span>
        <span>{formatRelativeDate(post.created_at)}</span>
      </div>
    </div>
  );
}
