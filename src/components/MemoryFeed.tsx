import type { FeedItem } from "@/lib/feed";
import { getMediaDimensions } from "@/lib/imageSize";
import { buildScatterLayout, type ScatterEntry } from "@/lib/scatter";
import { ScatterCanvas } from "@/components/ScatterCanvas";

async function toScatterEntry(item: FeedItem): Promise<ScatterEntry> {
  if (item.type === "photo") {
    const { width, height } = await getMediaDimensions(item.src, item.kind);
    return { id: item.id, type: "photo", src: item.src, kind: item.kind, width, height };
  }

  const mediaAspects = await Promise.all(
    item.post.media.map(async (media) => {
      const { width, height } = await getMediaDimensions(media.url, media.kind);
      return height / width;
    })
  );

  return { id: item.id, type: "card", post: item.post, mediaAspects };
}

export async function MemoryFeed({ items }: { items: FeedItem[] }) {
  const entries = await Promise.all(items.map(toScatterEntry));
  const layout = buildScatterLayout(entries);

  return (
    <section className="pb-24">
      {items.length === 0 ? (
        <p className="px-6 text-center text-sm text-muted">
          Nog geen herinneringen gedeeld — wees de eerste.
        </p>
      ) : (
        <div className="mx-auto max-w-[1600px] px-4 sm:px-8">
          <ScatterCanvas layout={layout} />
        </div>
      )}
    </section>
  );
}
