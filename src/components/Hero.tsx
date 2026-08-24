import Image from "next/image";
import { formatDate, type SiteConfig } from "@/lib/config";

export function Hero({ config }: { config: SiteConfig }) {
  return (
    <section className="flex flex-col items-center text-center px-6 pt-20 pb-14 sm:pt-28 sm:pb-16">
      <div className="relative w-56 h-56 sm:w-72 sm:h-72">
        <Image
          src={config.heroImage}
          alt={config.name}
          fill
          sizes="(min-width: 640px) 18rem, 14rem"
          className="object-cover"
          priority
        />
      </div>

      <h1 className="mt-10 font-serif text-3xl sm:text-4xl text-foreground">
        {config.name}
      </h1>
      <p className="mt-2 text-sm text-foreground">
        {formatDate(config.birthDate)}
      </p>
    </section>
  );
}
