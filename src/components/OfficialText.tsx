export function OfficialText({ paragraphs }: { paragraphs: string[] }) {
  return (
    <section className="mx-auto max-w-xl px-6 pb-16 sm:pb-20">
      <div className="mx-auto mb-8 h-px w-12 bg-border" />
      <div className="space-y-5 text-center">
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className="font-serif text-lg sm:text-xl leading-relaxed text-foreground"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
