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
          className="flex h-9 w-9 items-center justify-center overflow-hidden text-muted ring-1 ring-border transition-colors peer-checked:text-foreground peer-checked:ring-foreground"
          title="Verspreid"
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="block">
            <rect x="-2" y="4" width="7" height="7" fill="currentColor" />
            <rect x="14" y="-2" width="6" height="6" fill="currentColor" />
            <rect x="29" y="6" width="9" height="9" fill="currentColor" />
            <rect x="6" y="18" width="6" height="6" fill="currentColor" />
            <rect x="20" y="20" width="7" height="7" fill="currentColor" />
            <rect x="-2" y="28" width="6" height="6" fill="currentColor" />
            <rect x="14" y="31" width="6" height="6" fill="currentColor" />
            <rect x="30" y="29" width="8" height="8" fill="currentColor" />
          </svg>
        </span>
        <span className="sr-only">Verspreide weergave</span>
      </label>

      <label className="cursor-pointer">
        <input type="radio" name="scatterView" value="modular" className="peer sr-only" />
        <span
          className="flex h-9 w-9 items-center justify-center overflow-hidden text-muted ring-1 ring-border transition-colors peer-checked:text-foreground peer-checked:ring-foreground"
          title="Modulair"
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="block">
            <rect x="0" y="0" width="10" height="36" fill="currentColor" />
            <rect x="13" y="0" width="10" height="36" fill="currentColor" />
            <rect x="26" y="0" width="10" height="36" fill="currentColor" />
          </svg>
        </span>
        <span className="sr-only">Modulaire weergave</span>
      </label>
    </div>
  );
}
