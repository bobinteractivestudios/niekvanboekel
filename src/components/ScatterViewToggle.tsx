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
          className="flex h-9 w-9 items-center justify-center text-muted ring-1 ring-border transition-colors peer-checked:text-foreground peer-checked:ring-foreground"
          title="Verspreid"
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="2.4" height="2.4" fill="currentColor" />
            <rect x="8" y="1" width="2" height="2" fill="currentColor" />
            <rect x="13.5" y="3.5" width="2.8" height="2.8" fill="currentColor" />
            <rect x="4" y="9" width="2.2" height="2.2" fill="currentColor" />
            <rect x="11" y="10" width="2.4" height="2.4" fill="currentColor" />
            <rect x="1.5" y="14.5" width="1.8" height="1.8" fill="currentColor" />
            <rect x="8" y="15" width="2.2" height="2.2" fill="currentColor" />
            <rect x="14.5" y="14" width="2" height="2" fill="currentColor" />
          </svg>
        </span>
        <span className="sr-only">Verspreide weergave</span>
      </label>

      <label className="cursor-pointer">
        <input type="radio" name="scatterView" value="modular" className="peer sr-only" />
        <span
          className="flex h-9 w-9 items-center justify-center text-muted ring-1 ring-border transition-colors peer-checked:text-foreground peer-checked:ring-foreground"
          title="Modulair"
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="2" width="4.5" height="14" fill="currentColor" />
            <rect x="6.75" y="5" width="4.5" height="11" fill="currentColor" />
            <rect x="12.5" y="2" width="4.5" height="9" fill="currentColor" />
          </svg>
        </span>
        <span className="sr-only">Modulaire weergave</span>
      </label>
    </div>
  );
}
