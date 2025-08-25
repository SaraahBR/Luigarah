"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { galleryTheme as t } from "./galleryTheme";

type Props = {
  images: string[];
  className?: string;
};

function cx(...list: Array<string | false | null | undefined>) {
  return list.filter(Boolean).join(" ");
}

function gridCls(count: number) {
  if (count === 7) return cx("grid grid-cols-2 sm:grid-cols-12", t.gap);
  if (count === 6) return cx("grid grid-cols-2 sm:grid-cols-3", t.gap);
  if (count === 5) return cx("grid grid-cols-2 sm:grid-cols-6", t.gap);
  if (count === 4) return cx("grid grid-cols-2 sm:grid-cols-2", t.gap);
  if (count === 3) return cx("grid grid-cols-2 sm:grid-cols-2", t.gap);
  if (count === 2) return cx("grid grid-cols-2 sm:grid-cols-2", t.gap);
  return cx("grid grid-cols-1", t.gap);
}

function cellCls(count: number, i: number) {
  const base = "relative w-full overflow-hidden rounded-xl bg-zinc-100 focus:outline-none";
  const portrait = `${t.portrait.mobile} ${t.portrait.desktop}`;
  const square   = `${t.square.mobile}   ${t.square.desktop}`;
  const banner   = `${t.banner.mobile}   ${t.banner.desktop}`;

  if (count === 7) {
    if (i === 0) return cx(base, portrait, "sm:col-start-1  sm:col-end-5  sm:row-start-1 sm:row-end-2");
    if (i === 1) return cx(base, portrait, "sm:col-start-5  sm:col-end-9  sm:row-start-1 sm:row-end-2");
    if (i === 2) return cx(base, portrait, "sm:col-start-9  sm:col-end-13 sm:row-start-1 sm:row-end-2");
    if (i === 3) return cx(base, portrait, "sm:col-start-1  sm:col-end-4  sm:row-start-2 sm:row-end-3");
    if (i === 4) return cx(base, portrait, "sm:col-start-4  sm:col-end-7  sm:row-start-2 sm:row-end-3");
    if (i === 5) return cx(base, portrait, "sm:col-start-7  sm:col-end-10 sm:row-start-2 sm:row-end-3");
    return        cx(base, portrait, "sm:col-start-10 sm:col-end-13 sm:row-start-2 sm:row-end-3");
  }

  if (count === 6) return cx(base, square);
  if (count === 5) {
    if (i === 0) return cx(base, portrait, "sm:col-start-1 sm:col-end-4 sm:row-start-1 sm:row-end-2");
    if (i === 1) return cx(base, portrait, "sm:col-start-4 sm:col-end-7 sm:row-start-1 sm:row-end-2");
    if (i === 2) return cx(base, square,   "sm:col-start-1 sm:col-end-3 sm:row-start-2 sm:row-end-3");
    if (i === 3) return cx(base, square,   "sm:col-start-3 sm:col-end-5 sm:row-start-2 sm:row-end-3");
    return        cx(base, square,         "sm:col-start-5 sm:col-end-7 sm:row-start-2 sm:row-end-3");
  }

  if (count === 4) return cx(base, square);
  if (count === 3) { if (i === 0) return cx(base, banner, "sm:col-span-2"); return cx(base, square); }
  if (count === 2) return cx(base, portrait);
  return cx(base, banner);
}

export default function ProductGallery({ images, className }: Props) {
  const count = images.length;
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  const openAt = (i: number) => { setIdx(i); setOpen(true); };

  const close = useCallback(() => setOpen(false), []);
  const prev  = useCallback(() => setIdx((i) => (i - 1 + count) % count), [count]);
  const next  = useCallback(() => setIdx((i) => (i + 1) % count), [count]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, count, close, prev, next]);

  return (
    <>
      <div className={cx(gridCls(count), className)}>
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => openAt(i)}
            className={cellCls(count, i)}
            aria-label={`abrir imagem ${i + 1}`}
          >
            <Image src={src} alt={`imagem ${i + 1}`} fill className={t.objectFit} sizes={t.sizes} priority={i === 0} />
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/90" role="dialog" aria-modal="true" onClick={close}>
          <div className="relative mx-auto h-full w-full max-w-6xl flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={close}
              className="absolute right-4 md:right-6 top-4 md:top-6 z-[101] grid place-items-center rounded-full bg-white/10 px-3 py-2 text-white backdrop-blur ring-1 ring-white/30 hover:bg-white/20"
              aria-label="Fechar"
            >
              ✕
            </button>

            <div className="relative h-full w-full">
              <Image src={images[idx]} alt={`Imagem ${idx + 1}`} fill className="object-contain" priority />
            </div>

            <button
              onClick={prev}
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 grid place-items-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-white hover:bg-zinc-100 text-zinc-900 shadow-2xl ring-1 ring-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-500"
              aria-label="Imagem anterior"
            >
              <span aria-hidden className="text-3xl md:text-4xl leading-none">‹</span>
            </button>

            <button
              onClick={next}
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 grid place-items-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-white hover:bg-zinc-100 text-zinc-900 shadow-2xl ring-1 ring-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-500"
              aria-label="Próxima imagem"
            >
              <span aria-hidden className="text-3xl md:text-4xl leading-none">›</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
