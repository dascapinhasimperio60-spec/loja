"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { CaretLeft, CaretRight, X, MagnifyingGlassPlus } from "@phosphor-icons/react";
import type { ProductImage } from "@/lib/types";

/** Swipeable product photos with thumbnails and a fullscreen viewer. */
export function ProductGallery({ images, title }: { images: ProductImage[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const count = images.length;

  const go = useCallback(
    (next: number) => {
      if (!count) return;
      setDir(next > index ? 1 : -1);
      setIndex((next + count) % count);
    },
    [count, index],
  );

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (!el.open) return;
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -60 || info.velocity.x < -400) go(index + 1);
    else if (info.offset.x > 60 || info.velocity.x > 400) go(index - 1);
  }

  if (!count) {
    return <div className="grid aspect-[4/5] place-items-center rounded-[1.5rem] bg-panel-2 text-muted">Sem fotos</div>;
  }

  const current = images[index];

  return (
    <div>
      <div className="relative overflow-hidden rounded-[1.5rem] bg-panel-2 ring-1 ring-white/[0.06]">
        <div className="relative aspect-[4/5] touch-pan-y">
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.img
              key={current.id}
              src={current.url}
              alt={`${title}, foto ${index + 1} de ${count}`}
              width={current.width || 1200}
              height={current.height || 1500}
              fetchPriority={index === 0 ? "high" : "auto"}
              custom={dir}
              variants={{
                enter: (d: number) => ({ x: d > 0 ? "18%" : d < 0 ? "-18%" : 0, opacity: 0, scale: 1.02 }),
                center: { x: 0, opacity: 1, scale: 1 },
                exit: (d: number) => ({ x: d > 0 ? "-12%" : "12%", opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              drag={count > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={onDragEnd}
              className="absolute inset-0 size-full cursor-grab object-cover active:cursor-grabbing"
              draggable={false}
            />
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => dialog.current?.showModal()}
          className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-full bg-ink/70 text-led backdrop-blur transition-colors hover:bg-ink"
          aria-label="Ver foto em tela cheia"
        >
          <MagnifyingGlassPlus size={20} aria-hidden />
        </button>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              className="absolute left-3 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink/70 text-led backdrop-blur transition-colors hover:bg-ink sm:flex"
              aria-label="Foto anterior"
            >
              <CaretLeft size={20} weight="bold" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              className="absolute right-3 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink/70 text-led backdrop-blur transition-colors hover:bg-ink sm:flex"
              aria-label="Próxima foto"
            >
              <CaretRight size={20} weight="bold" aria-hidden />
            </button>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 sm:hidden" aria-hidden>
              {images.map((img, i) => (
                <span key={img.id} className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-5 bg-sign" : "w-1.5 bg-led/50"}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="mt-3 hidden grid-cols-6 gap-2.5 sm:grid" aria-label="Miniaturas">
          {images.map((img, i) => (
            <li key={img.id}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === index}
                className={`relative block aspect-square w-full overflow-hidden rounded-xl bg-panel-2 ring-2 transition-[box-shadow,opacity] ${
                  i === index ? "ring-sign" : "opacity-60 ring-transparent hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.thumb_url} alt="" loading="lazy" className="size-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialog}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-ink/96 p-0 text-led backdrop:bg-black/80"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
        aria-label={`Fotos de ${title}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm text-muted tabular">
              {index + 1} / {count}
            </p>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="flex size-11 items-center justify-center rounded-full bg-panel-2 text-led"
              aria-label="Fechar"
              autoFocus
            >
              <X size={22} aria-hidden />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.url} alt={`${title}, foto ${index + 1}`} className="max-h-full max-w-full rounded-xl object-contain" />
            {count > 1 && (
              <>
                <button type="button" onClick={() => go(index - 1)} className="absolute left-3 flex size-12 items-center justify-center rounded-full bg-panel-2/90" aria-label="Foto anterior">
                  <CaretLeft size={22} weight="bold" aria-hidden />
                </button>
                <button type="button" onClick={() => go(index + 1)} className="absolute right-3 flex size-12 items-center justify-center rounded-full bg-panel-2/90" aria-label="Próxima foto">
                  <CaretRight size={22} weight="bold" aria-hidden />
                </button>
              </>
            )}
          </div>
        </div>
      </dialog>
    </div>
  );
}
