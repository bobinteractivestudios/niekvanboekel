import Link from "next/link";

export function ShareLink() {
  return (
    <div className="flex justify-center pb-16 sm:pb-20">
      <Link
        href="/deel"
        className="text-sm text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground"
      >
        Deel een herinnering
      </Link>
    </div>
  );
}
