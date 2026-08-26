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
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border-2 border-border text-muted transition-colors peer-checked:border-foreground peer-checked:text-foreground"
          title="Verspreid"
        >
          <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="block">
            <rect x="6" y="8" width="34" height="20" fill="currentColor" />
            <rect x="84" y="-4" width="20" height="20" fill="currentColor" />
            <rect x="40" y="14" width="28" height="48" fill="currentColor" />
            <rect x="76" y="36" width="26" height="28" fill="currentColor" />
            <rect x="-2" y="68" width="28" height="34" fill="currentColor" />
            <rect x="64" y="78" width="28" height="24" fill="currentColor" />
          </svg>
        </span>
        <span className="sr-only">Verspreide weergave</span>
      </label>

      <label className="cursor-pointer">
        <input type="radio" name="scatterView" value="modular" className="peer sr-only" />
        <span
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border-2 border-border text-muted transition-colors peer-checked:border-foreground peer-checked:text-foreground"
          title="Modulair"
        >
          <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="block">
            <rect x="0" y="14" width="28" height="16" fill="currentColor" />
            <rect x="0" y="34" width="28" height="66" fill="currentColor" />
            <rect x="34" y="8" width="30" height="60" fill="currentColor" />
            <rect x="72" y="14" width="28" height="42" fill="currentColor" />
            <rect x="72" y="62" width="28" height="24" fill="currentColor" />
          </svg>
        </span>
        <span className="sr-only">Modulaire weergave</span>
      </label>
    </div>
  );
}
