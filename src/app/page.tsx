import { getSiteConfig } from "@/lib/config";
import { getAllPosts } from "@/lib/memories";
import { getGalleryImages } from "@/lib/gallery";
import { buildFeedItems } from "@/lib/feed";
import { Hero } from "@/components/Hero";
import { OfficialText } from "@/components/OfficialText";
import { MemoryFeed } from "@/components/MemoryFeed";
import { SiteFooter } from "@/components/SiteFooter";

export const dynamic = "force-dynamic";

export default async function Home() {
  const config = getSiteConfig();
  const posts = getAllPosts();
  const galleryImages = getGalleryImages();
  const items = buildFeedItems(posts, galleryImages);

  return (
    <>
      <main className="flex-1">
        <Hero config={config} />
        <OfficialText paragraphs={config.officialText} />
        <MemoryFeed items={items} />
      </main>
      <SiteFooter />
    </>
  );
}
