"use client";

import { useState, type ChangeEvent } from "react";
import { LoaderCircle, Upload } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { messages, type Locale } from "@/lib/messages";

export function AssetUploader({
  companyId,
  folder,
  accept,
  demo,
  locale,
  onUploaded,
}: {
  companyId: string;
  folder: "logos" | "banners" | "gallery" | "documents";
  accept: string;
  demo: boolean;
  locale: Locale;
  onUploaded: (url: string) => void;
}) {
  const copy = messages[locale];
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function uploadAsset(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    setError("");
    if (file.size > 20 * 1024 * 1024) {
      setError(copy.uploadSizeError);
      return;
    }
    if (demo) {
      onUploaded(URL.createObjectURL(file));
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError(copy.uploadError);
      return;
    }

    setPending(true);
    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
    const path = `${companyId}/${folder}/${crypto.randomUUID()}.${extension}`;
    const { data, error: storageError } = await supabase.storage
      .from("company-assets")
      .upload(path, file, { contentType: file.type, cacheControl: "3600", upsert: false });
    if (storageError || !data) {
      setError(copy.uploadError);
      setPending(false);
      return;
    }

    onUploaded(supabase.storage.from("company-assets").getPublicUrl(data.path).data.publicUrl);
    setPending(false);
  }

  return <div className="flex flex-wrap items-center gap-2">
    <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-sm border border-line px-3 text-xs font-semibold text-slate-700 transition hover:border-ocean hover:text-ocean">
      {pending ? <LoaderCircle size={14} className="animate-spin" /> : <Upload size={14} />}
      {copy.uploadFile}
      <input type="file" accept={accept} disabled={pending} onChange={uploadAsset} className="sr-only" />
    </label>
    {error && <span role="alert" className="text-xs text-red-700">{error}</span>}
  </div>;
}
