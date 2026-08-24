/**
 * Places photos at pseudo-random positions across the full width, without
 * overlapping. A fresh seed is drawn per render, so every page load lays the
 * photos out differently. The packing runs on the server and its result is
 * serialised into the markup, so the client never re-rolls it — the layout is
 * stable while you are on the page, and only changes when you reload.
 *
 * Pass an explicit `seed` to reproduce a given arrangement (used in tests).
 *
 * All coordinates live in "width units": the canvas is 100 units wide and
 * `canvasHeight` units tall, which the CSS turns into percentages.
 */

export type ScatterInput = {
  id: string;
  src: string;
  kind: "image" | "video";
  width: number;
  height: number;
};

export type ScatterPlacement = ScatterInput & {
  /** Left edge, in % of canvas width. */
  x: number;
  /** Top edge, in % of canvas height. */
  y: number;
  /** Width, in % of canvas width. */
  w: number;
};

export type ScatterLayout = {
  placements: ScatterPlacement[];
  /** Canvas height in width units — feeds the CSS aspect-ratio. */
  canvasHeight: number;
};

/** Small, fast seeded PRNG so the arrangement is reproducible. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SLOTS = 400; // horizontal resolution of the skyline, 0.25 units per slot
const SLOT_WIDTH = 100 / SLOTS;
const CANDIDATES = 4; // tried positions per photo; lowest landing spot wins

/** Photo widths shrink as the library grows, so the page stays browsable. */
function widthRange(count: number): [number, number] {
  if (count <= 6) return [24, 34];
  if (count <= 15) return [18, 27];
  if (count <= 40) return [14, 22];
  return [11, 18];
}

export function buildScatterLayout(
  photos: ScatterInput[],
  seed: number = Math.floor(Math.random() * 0x100000000)
): ScatterLayout {
  if (photos.length === 0) return { placements: [], canvasHeight: 0 };

  const random = mulberry32(seed);
  const [minWidth, maxWidth] = widthRange(photos.length);

  const skyline = new Array<number>(SLOTS).fill(0);
  const placements: ScatterPlacement[] = [];

  const highestIn = (startSlot: number, endSlot: number): number => {
    let highest = 0;
    for (let i = startSlot; i < endSlot; i++) {
      if (skyline[i] > highest) highest = skyline[i];
    }
    return highest;
  };

  for (const photo of photos) {
    const w = minWidth + random() * (maxWidth - minWidth);
    const h = w * (photo.height / photo.width);

    // Try a few random horizontal spots and keep the one that sits highest up,
    // which fills gaps instead of stacking everything into towers.
    let best: { x: number; y: number } | null = null;
    for (let attempt = 0; attempt < CANDIDATES; attempt++) {
      const x = random() * (100 - w);
      const startSlot = Math.floor(x / SLOT_WIDTH);
      const endSlot = Math.min(SLOTS, Math.ceil((x + w) / SLOT_WIDTH));
      const gap = 1.5 + random() * 4.5;
      const y = highestIn(startSlot, endSlot) + gap;
      if (!best || y < best.y) best = { x, y };
    }

    const { x, y } = best!;
    const startSlot = Math.floor(x / SLOT_WIDTH);
    const endSlot = Math.min(SLOTS, Math.ceil((x + w) / SLOT_WIDTH));
    for (let i = startSlot; i < endSlot; i++) {
      skyline[i] = y + h;
    }

    placements.push({ ...photo, x, y, w });
  }

  const canvasHeight = Math.max(...skyline);

  return {
    placements: placements.map((placement) => ({
      ...placement,
      // Convert the vertical position to a share of the canvas height.
      y: (placement.y / canvasHeight) * 100,
    })),
    canvasHeight,
  };
}
