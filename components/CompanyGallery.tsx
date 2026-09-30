"use client";

import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, Expand, X } from "lucide-react";
import { useState } from "react";
import type { CompanyGalleryRecord } from "@/types/database";

export function CompanyGallery({ images }: { images: CompanyGalleryRecord[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage = activeIndex === null ? null : images[activeIndex];

  function showNext(direction: number) {
    if (activeIndex === null || images.length === 0) return;
    setActiveIndex((activeIndex + direction + images.length) % images.length);
  }

  return (
    <>
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {images.map((image, index) => (
            <button key={image.id} type="button" onClick={() => setActiveIndex(index)} aria-label={`View photo: ${image.caption ?? `Operations photo ${index + 1}`}`} className={`group relative aspect-[4/3] overflow-hidden rounded-sm bg-slate-200 text-left ${index === 0 ? "col-span-2 md:row-span-2 md:aspect-auto" : ""}`}>
              <Image src={image.image_url} alt={image.caption ?? "Company operations"} fill sizes={index === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 50vw, 33vw"} className="object-cover transition duration-500 group-hover:scale-[1.035]" />
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/65 to-transparent px-4 pb-3 pt-10 text-sm font-medium text-white">
                <span className="truncate pr-3">{image.caption || `Operations photo ${index + 1}`}</span>
                <Expand size={16} className="shrink-0 opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>
      ) : <p className="border-y border-line py-8 text-sm text-slate-500">No operational photos have been added to this profile.</p>}

      <Dialog.Root open={activeIndex !== null} onOpenChange={(open) => !open && setActiveIndex(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-[#071723]/95 data-[state=open]:animate-in" />
          <Dialog.Content aria-describedby={undefined} className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none sm:p-10">
            <Dialog.Title className="sr-only">Company photo gallery</Dialog.Title>
            {activeImage && <div className="relative h-full w-full max-w-6xl">
              <Image src={activeImage.image_url} alt={activeImage.caption ?? "Company operations"} fill sizes="100vw" className="object-contain" />
              <p className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-sm bg-black/55 px-3 py-2 text-center text-sm text-white">{activeImage.caption ?? "Company operations"} <span className="ml-2 text-white/65">{(activeIndex ?? 0) + 1} / {images.length}</span></p>
            </div>}
            <Dialog.Close aria-label="Close gallery" className="absolute right-4 top-4 grid size-10 place-items-center rounded-sm bg-white/10 text-white transition hover:bg-white/20"><X size={20} /></Dialog.Close>
            {images.length > 1 && <>
              <button type="button" onClick={() => showNext(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-sm bg-white/10 text-white hover:bg-white/20 sm:left-6"><ArrowLeft size={20} /></button>
              <button type="button" onClick={() => showNext(1)} aria-label="Next photo" className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-sm bg-white/10 text-white hover:bg-white/20 sm:right-6"><ArrowRight size={20} /></button>
            </>}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
