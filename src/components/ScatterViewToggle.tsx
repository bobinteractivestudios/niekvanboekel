/**
 * Lets a desktop visitor switch the feed below between the freeform
 * scattered layout and an ordered multi-column one. Pure HTML/CSS (a radio
 * pair + the :has() rule in globals.css) — no client JS needed for a
 * purely visual choice. Hidden below the desktop breakpoint, where the
 * scattered layout doesn't apply anyway.
 */
export function ScatterViewToggle() {
  return (
    <div className="mb-4 hidden justify-end gap-2 lg:flex">
      <label className="cursor-pointer">
        <input type="radio" name="scatterView" value="scatter" defaultChecked className="peer sr-only" />
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted ring-1 ring-border transition-colors peer-checked:text-foreground peer-checked:ring-foreground"
          title="Verspreid"
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="3" cy="4" r="1.4" fill="currentColor" />
            <circle cx="9" cy="2" r="1.1" fill="currentColor" />
            <circle cx="15" cy="5" r="1.6" fill="currentColor" />
            <circle cx="5" cy="10" r="1.2" fill="currentColor" />
            <circle cx="12" cy="11" r="1.4" fill="currentColor" />
            <circle cx="2" cy="15" r="1" fill="currentColor" />
            <circle cx="9" cy="16" r="1.3" fill="currentColor" />
            <circle cx="16" cy="15" r="1.1" fill="currentColor" />
          </svg>
        </span>
        <span className="sr-only">Verspreide weergave</span>
      </label>

      <label className="cursor-pointer">
        <input type="radio" name="scatterView" value="modular" className="peer sr-only" />
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted ring-1 ring-border transition-colors peer-checked:text-foreground peer-checked:ring-foreground"
          title="Modulair"
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="2" width="4.5" height="14" rx="1" fill="currentColor" />
            <rect x="6.75" y="5" width="4.5" height="11" rx="1" fill="currentColor" />
            <rect x="12.5" y="2" width="4.5" height="9" rx="1" fill="currentColor" />
          </svg>
        </span>
        <span className="sr-only">Modulaire weergave</span>
      </label>
    </div>
  );
}
