import Image from "next/image";
import { isAuthenticated } from "@/lib/auth";
import { getAllPosts, type PostWithMedia } from "@/lib/db";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { deletePost, logout } from "@/app/beheer/actions";
import { linkify } from "@/lib/linkify";

export const dynamic = "force-dynamic";

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function MediaGrid({ post }: { post: PostWithMedia }) {
  if (post.media.length === 0) return null;
  return (
    <div className="mt-3 grid grid-cols-3 gap-2">
      {post.media.map((item) =>
        item.kind === "video" ? (
          <video key={item.id} src={item.url} controls className="h-24 w-full rounded-lg object-cover" />
        ) : (
          <Image
            key={item.id}
            src={item.url}
            alt=""
            width={200}
            height={200}
            className="h-24 w-full rounded-lg object-cover"
          />
        )
      )}
    </div>
  );
}

function PostCard({ post }: { post: PostWithMedia }) {
  return (
    <div className="rounded-2xl bg-surface p-5 ring-1 ring-border">
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{post.author_name?.trim() || "Anoniem"}</span>
        <span>{formatDateTime(post.created_at)}</span>
      </div>
      {post.body && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{linkify(post.body)}</p>
      )}
      <MediaGrid post={post} />
      <div className="mt-4">
        <form action={deletePost.bind(null, post.id)}>
          <button className="text-xs text-red-600 hover:underline">Verwijderen</button>
        </form>
      </div>
    </div>
  );
}

export default async function BeheerPage() {
  const authed = await isAuthenticated();

  if (!authed) {
    return (
      <main className="flex-1">
        <AdminLoginForm />
      </main>
    );
  }

  const posts = await getAllPosts();

  return (
    <main className="flex-1 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl text-foreground">Beheer</h1>
          <form action={logout}>
            <button className="text-xs text-muted hover:text-foreground">Uitloggen</button>
          </form>
        </div>

        <p className="mt-2 text-sm text-muted">
          Alles wat via de site gedeeld wordt staat direct live. Hier kun je iets
          verwijderen als dat nodig is.
        </p>

        <section className="mt-10">
          <h2 className="text-sm font-medium text-foreground">
            Gedeelde herinneringen {posts.length > 0 && `(${posts.length})`}
          </h2>
          {posts.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Nog niets gedeeld.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
