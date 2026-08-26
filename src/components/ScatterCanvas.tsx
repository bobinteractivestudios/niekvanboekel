import type { CSSProperties } from "react";
import type { ScatterLayout } from "@/lib/scatter";
import { MemoryCard } from "@/components/MemoryCard";
import { ClickableImage } from "@/components/ClickableImage";

type ScatterVars = CSSProperties & {
  "--x"?: string;
  "--y"?: string;
  "--w"?: string;
  "--canvas-h"?: string;
};

export function ScatterCanvas({ layout }: { layout: ScatterLayout }) {
  if (layout.placements.length === 0) return null;

  const canvasStyle: ScatterVars = {
    "--canvas-h": String(layout.canvasHeight),
  };

  return (
    <div className="scatter" style={canvasStyle}>
      {layout.placements.map((item) => {
        const itemStyle: ScatterVars = {
          "--x": `${item.x}%`,
          "--y": `${item.y}%`,
          "--w": `${item.w}%`,
        };

        return (
          <div key={item.id} className="scatter-item" style={itemStyle}>
            {item.type === "card" ? (
              <MemoryCard post={item.post} />
            ) : item.kind === "video" ? (
              <video src={item.src} controls className="block w-full h-auto" />
            ) : (
              <ClickableImage
                src={item.src}
                width={item.width}
                height={item.height}
                sizes="(min-width: 768px) 30vw, 100vw"
                className="block w-full h-auto"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
