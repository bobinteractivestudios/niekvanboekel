import Link from "next/link";
import { getSiteConfig } from "@/lib/config";
import { UploadForm } from "@/components/UploadForm";

export default function DeelPage() {
  const config = getSiteConfig();

  return (
    <main className="flex-1 px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          ← Terug
        </Link>

        <h1 className="mt-6 font-serif text-3xl text-foreground">
          Deel een herinnering aan {config.name}
        </h1>
        <p className="mt-3 text-sm text-muted">
          Je bericht komt direct op de pagina te staan.
        </p>

        <div className="mt-10">
          <UploadForm />
        </div>
      </div>
    </main>
  );
}
