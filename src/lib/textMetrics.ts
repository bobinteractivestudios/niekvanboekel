/**
 * Estimates how tall a memory card will render, so the scatter packer
 * (lib/scatter.ts) can reserve space for it before anything is actually
 * laid out in the browser. Text doesn't have a fixed aspect ratio like a
 * photo does — its height depends on how it wraps at a given width — so
 * this is a heuristic: average glyph width times a safety margin, biased
 * toward overestimating rather than under. That keeps cards from ever
 * visually overlapping the item placed below them, at the cost of an
 * occasional bit of extra breathing room under a card.
 *
 * The estimate is pinned to an assumed desktop container width. The
 * scatter only positions things this way from the tablet breakpoint up —
 * on phones everything stacks in normal document flow (see globals.css)
 * where the browser wraps text correctly on its own, so the estimate only
 * has to hold up for the layout it's actually used in.
 */

const REFERENCE_CANVAS_PX = 1200;
const CHAR_WIDTH_PX = 8.2;
const LINE_HEIGHT_PX = 24;
const CARD_PADDING_X_PX = 24;
const CARD_PADDING_TOP_PX = 20;
const CARD_PADDING_BOTTOM_PX = 20;
const META_ROW_PX = 28;
const MEDIA_GAP_PX = 16;
const MEDIA_GRID_GAP_PX = 8;
const SAFETY_MULTIPLIER = 1.15;

export function widthUnitsToPx(widthUnits: number): number {
  return (widthUnits / 100) * REFERENCE_CANVAS_PX;
}

export function pxToHeightUnits(heightPx: number): number {
  return (heightPx / REFERENCE_CANVAS_PX) * 100;
}

function estimateParagraphLines(paragraph: string, widthPx: number): number {
  const trimmed = paragraph.trim();
  if (trimmed.length === 0) return 1;
  const charsPerLine = Math.max(10, Math.floor(widthPx / CHAR_WIDTH_PX));
  return Math.max(1, Math.ceil(trimmed.length / charsPerLine));
}

function estimateTextHeightPx(body: string, widthPx: number): number {
  const lines = body
    .split("\n")
    .reduce((sum, paragraph) => sum + estimateParagraphLines(paragraph, widthPx), 0);
  return lines * LINE_HEIGHT_PX;
}

/**
 * @param mediaAspects height/width ratio of each attached photo or video,
 *   in the same order they'll render — mirrors the 1-col / 2-col grid in
 *   MemoryCard.
 */
export function estimateCardHeightPx(
  body: string | null,
  mediaAspects: number[],
  cardWidthPx: number
): number {
  const contentWidthPx = Math.max(60, cardWidthPx - CARD_PADDING_X_PX * 2);
  let height = CARD_PADDING_TOP_PX + CARD_PADDING_BOTTOM_PX + META_ROW_PX;

  if (body && body.trim()) {
    height += estimateTextHeightPx(body, contentWidthPx);
  }

  if (mediaAspects.length > 0) {
    const cols = mediaAspects.length === 1 ? 1 : 2;
    const cellWidthPx = (contentWidthPx - MEDIA_GRID_GAP_PX * (cols - 1)) / cols;
    const rows = Math.ceil(mediaAspects.length / cols);
    const avgAspect =
      mediaAspects.reduce((sum, aspect) => sum + aspect, 0) / mediaAspects.length;
    const cellHeightPx = cellWidthPx * avgAspect;
    height += MEDIA_GAP_PX + rows * cellHeightPx + MEDIA_GRID_GAP_PX * Math.max(0, rows - 1);
  }

  return height * SAFETY_MULTIPLIER;
}
