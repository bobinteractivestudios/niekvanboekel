"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type LightboxContextValue = {
  open: (src: string) => void;
};

const LightboxContext = createContext<LightboxContextValue | null>(null);

export function useLightbox(): LightboxContextValue {
  const ctx = useContext(LightboxContext);
  if (!ctx) {
    throw new Error("useLightbox must be used within LightboxProvider");
  }
  return ctx;
}

export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [src, setSrc] = useState<string | null>(null);
  const close = useCallback(() => setSrc(null), []);

  useEffect(() => {
    if (!src) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [src, close]);

  return (
    <LightboxContext.Provider value={{ open: setSrc }}>
      {children}
      {src && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Foto vergroot"
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Sluiten"
            className="absolute right-4 top-4 text-3xl leading-none text-white/80 hover:text-white sm:right-6 sm:top-6"
          >
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary-size modal preview, next/image needs known dimensions */}
          <img
            src={src}
            alt=""
            onClick={(event) => event.stopPropagation()}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}
    </LightboxContext.Provider>
  );
}
