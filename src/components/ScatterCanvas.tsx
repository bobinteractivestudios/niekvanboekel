import Image from "next/image";
import type { CSSProperties } from "react";
import type { ScatterLayout } from "@/lib/scatter";

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
          <figure key={item.id} className="scatter-item" style={itemStyle}>
            {item.kind === "video" ? (
              <video src={item.src} controls className="block w-full h-auto" />
            ) : (
              <Image
                src={item.src}
                alt=""
                width={item.width}
                height={item.height}
                sizes="(min-width: 768px) 30vw, 100vw"
                className="block w-full h-auto"
              />
            )}
          </figure>
        );
      })}
    </div>
  );
}
