import { getSiteConfig } from "@/lib/config";
import { getApprovedPosts } from "@/lib/db";
import { getGalleryImages } from "@/lib/gallery";
import { buildFeedItems } from "@/lib/feed";
import { Hero } from "@/components/Hero";
import { OfficialText } from "@/components/OfficialText";
import { ShareLink } from "@/components/ShareLink";
import { MemoryFeed } from "@/components/MemoryFeed";
import { SiteFooter } from "@/components/SiteFooter";

export const dynamic = "force-dynamic";

export default async function Home() {
  const config = getSiteConfig();
  const posts = await getApprovedPosts();
  const galleryImages = getGalleryImages();
  const items = buildFeedItems(posts, galleryImages);

  return (
    <>
      <main className="flex-1">
        <Hero config={config} />
        <OfficialText paragraphs={config.officialText} />
        <ShareLink />
        <MemoryFeed items={items} />
      </main>
      <SiteFooter />
    </>
  );
}
