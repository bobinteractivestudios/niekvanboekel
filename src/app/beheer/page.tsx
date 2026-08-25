import Image from "next/image";
import { isAuthenticated } from "@/lib/auth";
import { getPendingPosts, getReviewedPosts, type PostWithMedia } from "@/lib/db";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { approvePost, rejectPost, deletePost, logout } from "@/app/beheer/actions";

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

function PendingCard({ post }: { post: PostWithMedia }) {
  return (
    <div className="rounded-2xl bg-surface p-5 ring-1 ring-border">
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{post.author_name?.trim() || "Anoniem"}</span>
        <span>{formatDateTime(post.created_at)}</span>
      </div>
      {post.body && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{post.body}</p>
      )}
      <MediaGrid post={post} />
      <div className="mt-4 flex gap-2">
        <form action={approvePost.bind(null, post.id)}>
          <button className="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-accent-foreground hover:bg-accent-hover">
            Goedkeuren
          </button>
        </form>
        <form action={rejectPost.bind(null, post.id)}>
          <button className="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted hover:text-foreground">
            Afwijzen
          </button>
        </form>
      </div>
    </div>
  );
}

function ReviewedRow({ post }: { post: PostWithMedia }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl px-4 py-3 ring-1 ring-border">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span
            className={
              post.status === "approved"
                ? "rounded-full bg-accent/20 px-2 py-0.5 text-accent-hover"
                : "rounded-full bg-border px-2 py-0.5"
            }
          >
            {post.status === "approved" ? "Zichtbaar" : "Afgewezen"}
          </span>
          <span>{post.author_name?.trim() || "Anoniem"}</span>
          <span>·</span>
          <span>{formatDateTime(post.created_at)}</span>
          {post.media.length > 0 && (
            <>
              <span>·</span>
              <span>{post.media.length} bestand(en)</span>
            </>
          )}
        </div>
        {post.body && <p className="mt-1 truncate text-sm text-foreground">{post.body}</p>}
      </div>
      <form action={deletePost.bind(null, post.id)}>
        <button className="shrink-0 text-xs text-red-600 hover:underline">Verwijderen</button>
      </form>
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

  const pending = await getPendingPosts();
  const reviewed = await getReviewedPosts();

  return (
    <main className="flex-1 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl text-foreground">Beheer</h1>
          <form action={logout}>
            <button className="text-xs text-muted hover:text-foreground">Uitloggen</button>
          </form>
        </div>

        <section className="mt-10">
          <h2 className="text-sm font-medium text-foreground">
            Te beoordelen {pending.length > 0 && `(${pending.length})`}
          </h2>
          {pending.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Niets nieuws te beoordelen.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {pending.map((post) => (
                <PendingCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-12">
          <h2 className="text-sm font-medium text-foreground">Eerder beoordeeld</h2>
          {reviewed.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Nog niets beoordeeld.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {reviewed.map((post) => (
                <ReviewedRow key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
