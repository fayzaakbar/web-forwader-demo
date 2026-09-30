"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Download, ExternalLink, FileText, X } from "lucide-react";
import { getSafeHttpUrl } from "@/lib/forwarder-utils";
import { messages, type Locale } from "@/lib/messages";

export function ProfileDocument({ url, companyName, locale }: { url: string | null; companyName: string; locale: Locale }) {
  const copy = messages[locale];
  const documentUrl = getSafeHttpUrl(url);
  if (!documentUrl) return <p className="border-y border-line py-8 text-sm text-slate-500">{copy.noPdf}</p>;

  return (
    <Dialog.Root>
      <div className="flex flex-col gap-4 border-y border-line py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-sm bg-[#eaf1f3] text-ocean"><FileText size={20} /></span>
          <div><p className="font-semibold text-ink">{companyName} · {copy.companyProfile}</p><p className="mt-0.5 text-xs text-slate-500">PDF</p></div>
        </div>
        <div className="flex gap-2">
          <Dialog.Trigger className="inline-flex h-10 items-center gap-2 rounded-sm border border-line px-3.5 text-sm font-semibold text-ink transition hover:border-ocean hover:text-ocean"><FileText size={15} /> {copy.previewPdf}</Dialog.Trigger>
          <a href={documentUrl} download target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-sm bg-ink px-3.5 text-sm font-semibold text-white transition hover:bg-[#183b59]"><Download size={15} /> {copy.downloadPdf}</a>
        </div>
      </div>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/70" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[min(88vh,900px)] w-[min(94vw,1100px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-md bg-white shadow-2xl outline-none">
          <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
            <Dialog.Title className="font-semibold text-ink">{companyName} · {copy.companyProfile}</Dialog.Title>
            <div className="flex items-center gap-2">
              <a href={documentUrl} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-sm border border-line px-3 text-sm font-medium text-ink hover:border-ocean hover:text-ocean"><ExternalLink size={14} /> {copy.openPdf}</a>
              <Dialog.Close aria-label="Close PDF preview" className="grid size-9 place-items-center rounded-sm text-slate-500 hover:bg-slate-100"><X size={18} /></Dialog.Close>
            </div>
          </div>
          <iframe src={`${documentUrl}#toolbar=1&navpanes=0`} title={`${companyName} company profile PDF`} className="min-h-0 flex-1 bg-slate-100" />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
