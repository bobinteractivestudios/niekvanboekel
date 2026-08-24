import type { FeedItem } from "@/lib/feed";
import { getMediaDimensions } from "@/lib/imageSize";
import { buildScatterLayout, type ScatterInput } from "@/lib/scatter";
import { MemoryCard } from "@/components/MemoryCard";
import { ScatterCanvas } from "@/components/ScatterCanvas";

export async function MemoryFeed({ items }: { items: FeedItem[] }) {
  const photoItems = items.filter(
    (item): item is Extract<FeedItem, { type: "photo" }> => item.type === "photo"
  );
  const postItems = items.filter(
    (item): item is Extract<FeedItem, { type: "post" }> => item.type === "post"
  );

  const photos: ScatterInput[] = await Promise.all(
    photoItems.map(async (item) => {
      const { width, height } = await getMediaDimensions(item.src, item.kind);
      return { id: item.id, src: item.src, kind: item.kind, width, height };
    })
  );

  const layout = buildScatterLayout(photos);

  return (
    <section className="pb-24">
      {items.length === 0 ? (
        <p className="px-6 text-center text-sm text-muted">
          Nog geen herinneringen gedeeld — wees de eerste.
        </p>
      ) : (
        <>
          <div className="mx-auto max-w-[1600px] px-4 sm:px-8">
            <ScatterCanvas layout={layout} />
          </div>

          {postItems.length > 0 && (
            <div className="mx-auto mt-24 max-w-xl space-y-5 px-6">
              {postItems.map((item) => (
                <MemoryCard key={item.id} post={item.post} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
