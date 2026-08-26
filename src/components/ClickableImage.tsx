"use client";

import Image from "next/image";
import { useLightbox } from "@/components/PhotoLightbox";

type BaseProps = {
  src: string;
  alt?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

type ClickableImageProps =
  | (BaseProps & { fill: true })
  | (BaseProps & { fill?: false; width: number; height: number });

export function ClickableImage(props: ClickableImageProps) {
  const { open } = useLightbox();
  const { src, alt = "", className } = props;

  return (
    <button
      type="button"
      onClick={() => open(src)}
      aria-label="Foto vergroten"
      className={
        props.fill
          ? "absolute inset-0 cursor-zoom-in appearance-none border-0 bg-transparent p-0 text-left"
          : "block w-full cursor-zoom-in appearance-none border-0 bg-transparent p-0 text-left"
      }
    >
      {props.fill ? (
        <Image src={src} alt={alt} fill sizes={props.sizes} priority={props.priority} className={className} />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={props.width}
          height={props.height}
          sizes={props.sizes}
          priority={props.priority}
          className={className}
        />
      )}
    </button>
  );
}
