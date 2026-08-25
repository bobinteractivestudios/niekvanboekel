/**
 * Places every memory — loose photos/videos and text cards alike — at
 * pseudo-random positions across the full width, without overlapping. A
 * fresh seed is drawn per render, so every page load lays things out
 * differently. The packing runs on the server and its result is serialised
 * into the markup, so the client never re-rolls it — the layout is stable
 * while you're on the page, and only changes on reload.
 *
 * Photo/video boxes use their real aspect ratio. Text cards don't have
 * one — their height depends on how the text wraps — so it's estimated in
 * lib/textMetrics.ts from the body length and the chosen card width, with a
 * safety margin built in so a card never overlaps whatever lands below it.
 *
 * Pass an explicit `seed` to reproduce a given arrangement (used in tests).
 *
 * All coordinates live in "width units": the canvas is 100 units wide and
 * `canvasHeight` units tall, which the CSS turns into percentages.
 */

import type { PostWithMedia } from "@/lib/db";
import { estimateCardHeightPx, pxToHeightUnits, widthUnitsToPx } from "@/lib/textMetrics";

export type ScatterPhotoEntry = {
  id: string;
  type: "photo";
  src: string;
  kind: "image" | "video";
  width: number;
  height: number;
};

export type ScatterCardEntry = {
  id: string;
  type: "card";
  post: PostWithMedia;
  /** height/width per attached media file, same order as post.media. */
  mediaAspects: number[];
};

export type ScatterEntry = ScatterPhotoEntry | ScatterCardEntry;

export type ScatterPlacement = ScatterEntry & {
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

/** Small, fast seeded PRNG so the arrangement is reproducible per seed. */
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
const CANDIDATES = 4; // tried positions per item; lowest landing spot wins

/** Widths shrink as the collection grows, so the page stays browsable. */
function widthRange(count: number): [number, number] {
  if (count <= 6) return [24, 34];
  if (count <= 15) return [18, 27];
  if (count <= 40) return [14, 22];
  return [11, 18];
}

/** Text cards stay wide enough to read even in a large collection. */
function cardWidthRange(count: number): [number, number] {
  const [min, max] = widthRange(count);
  return [Math.max(min, 22), Math.max(max, 30)];
}

export function buildScatterLayout(
  entries: ScatterEntry[],
  seed: number = Math.floor(Math.random() * 0x100000000)
): ScatterLayout {
  if (entries.length === 0) return { placements: [], canvasHeight: 0 };

  const random = mulberry32(seed);
  const [minPhotoWidth, maxPhotoWidth] = widthRange(entries.length);
  const [minCardWidth, maxCardWidth] = cardWidthRange(entries.length);

  const skyline = new Array<number>(SLOTS).fill(0);
  const placements: ScatterPlacement[] = [];

  const highestIn = (startSlot: number, endSlot: number): number => {
    let highest = 0;
    for (let i = startSlot; i < endSlot; i++) {
      if (skyline[i] > highest) highest = skyline[i];
    }
    return highest;
  };

  for (const entry of entries) {
    let w: number;
    let h: number;

    if (entry.type === "photo") {
      w = minPhotoWidth + random() * (maxPhotoWidth - minPhotoWidth);
      h = w * (entry.height / entry.width);
    } else {
      w = minCardWidth + random() * (maxCardWidth - minCardWidth);
      const heightPx = estimateCardHeightPx(
        entry.post.body,
        entry.mediaAspects,
        widthUnitsToPx(w)
      );
      h = pxToHeightUnits(heightPx);
    }

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

    placements.push({ ...entry, x, y, w });
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
