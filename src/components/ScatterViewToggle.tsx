/**
 * Lets a desktop visitor switch the feed below between the freeform
 * scattered layout and an ordered multi-column one. Pure HTML/CSS (a radio
 * pair + the :has() rule in globals.css) — no client JS needed for a
 * purely visual choice. Hidden below the desktop breakpoint, where the
 * scattered layout doesn't apply anyway.
 *
 * Icon artwork supplied as ready-made SVGs; ported in with the fill
 * swapped to currentColor so the blocks follow the button's soft-gray
 * default/selected color state. The frame is a plain CSS border instead
 * of the source file's own stroke, which is easier to size reliably at
 * this display size.
 */
export function ScatterViewToggle() {
  return (
    <div className="mb-4 hidden justify-end gap-2 lg:flex">
      <label className="cursor-pointer">
        <input type="radio" name="scatterView" value="scatter" defaultChecked className="peer sr-only" />
        <span
          className="flex h-7 w-7 items-center justify-center rounded-md border-[1.5px] border-gray-300 text-gray-300 transition-colors peer-checked:border-gray-500 peer-checked:text-gray-500"
          title="Verspreid"
        >
          <svg width="28" height="28" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1.152118,0,0,0.997009,-76.039794,2.991027)">
              <g transform="matrix(1,0,0,0.218274,-67,0)">
                <rect x="133" y="0" width="236" height="591" fill="currentColor" />
              </g>
              <g transform="matrix(0.593702,0,0,0.114213,714.890433,-3)">
                <rect x="133" y="0" width="236" height="591" fill="currentColor" />
              </g>
              <g transform="matrix(0.838473,0,0,0.34742,624.569977,200.908)">
                <rect x="133" y="0" width="236" height="591" fill="currentColor" />
              </g>
              <g transform="matrix(1.000368,0,0,0.34742,484.994476,794.674618)">
                <rect x="133" y="0" width="236" height="591" fill="currentColor" />
              </g>
              <g transform="matrix(1,0,0,0.649478,-67,616.158648)">
                <rect x="133" y="0" width="236" height="591" fill="currentColor" />
              </g>
              <g transform="matrix(1.000368,0,0,0.578229,248.907567,64.5)">
                <rect x="133" y="0" width="236" height="591" fill="currentColor" />
              </g>
              <g transform="matrix(1.000368,0,0,0.461618,366.951022,479.750648)">
                <rect x="133" y="0" width="236" height="591" fill="currentColor" />
              </g>
            </g>
          </svg>
        </span>
        <span className="sr-only">Verspreide weergave</span>
      </label>

      <label className="cursor-pointer">
        <input type="radio" name="scatterView" value="modular" className="peer sr-only" />
        <span
          className="flex h-7 w-7 items-center justify-center rounded-md border-[1.5px] border-gray-300 text-gray-300 transition-colors peer-checked:border-gray-500 peer-checked:text-gray-500"
          title="Modulair"
        >
          <svg width="28" height="28" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1.152118,0,0,0.997009,-42.08515,2.991027)">
              <g transform="matrix(0.91715,0,0,0.218274,-49.496716,0)">
                <rect x="133" y="0" width="236" height="591" fill="currentColor" />
              </g>
              <g transform="matrix(0.91715,0,0,1.383249,-49.496716,182.5)">
                <rect x="133" y="0" width="236" height="591" fill="currentColor" />
              </g>
              <g transform="matrix(0.91715,0,0,1,240.322564,0)">
                <rect x="133" y="0" width="236" height="591" fill="currentColor" />
              </g>
              <g transform="matrix(0.91715,0,0,0.522843,240.322564,691)">
                <rect x="133" y="0" width="236" height="591" fill="currentColor" />
              </g>
              <g transform="matrix(0.91715,0,0,0.676819,530.111191,-3)">
                <rect x="133" y="0" width="236" height="591" fill="currentColor" />
              </g>
              <g transform="matrix(0.91715,0,0,0.8511,530.111191,497)">
                <rect x="133" y="0" width="236" height="591" fill="currentColor" />
              </g>
            </g>
          </svg>
        </span>
        <span className="sr-only">Modulaire weergave</span>
      </label>
    </div>
  );
}
