"use client";

import type { Locale } from "@/lib/messages";

export function LanguageToggle({ locale }: { locale: Locale }) {
  function changeLocale(nextLocale: Locale) {
    document.cookie = `routewise_locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  }

  return <div role="group" aria-label="Language" className="inline-flex h-8 items-center rounded-sm border border-line p-0.5 text-[11px] font-semibold">
    {(["id", "en"] as const).map((item) => <button key={item} type="button" onClick={() => changeLocale(item)} aria-pressed={locale === item} className={`grid h-7 min-w-8 place-items-center rounded-[2px] px-1.5 uppercase transition ${locale === item ? "bg-ink text-white" : "text-slate-500 hover:text-ink"}`}>{item}</button>)}
  </div>;
}
