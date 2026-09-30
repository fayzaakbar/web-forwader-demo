import Link from "next/link";
import { Anchor, ArrowUpRight, LogOut } from "lucide-react";
import { signOutAction } from "@/app/login/actions";
import { LanguageToggle } from "@/components/LanguageToggle";
import { getLocale, messages } from "@/lib/i18n";

export async function DashboardHeader({ workspace, email, demo = false }: { workspace: "Platform admin" | "Forwarder workspace"; email: string; demo?: boolean }) {
  const locale = await getLocale();
  const copy = messages[locale];
  return <header className="border-b border-line bg-white">
    <div className="mx-auto flex min-h-[68px] max-w-[1400px] flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8 lg:px-12">
      <div className="flex items-center gap-3">
        <Link href="/" aria-label="Routewise directory" className="grid size-9 place-items-center rounded-sm bg-ink text-white"><Anchor size={18} /></Link>
        <div><p className="font-display text-sm font-bold text-ink">Routewise</p><p className="text-[11px] text-slate-500">{demo ? copy.demoWorkspace : workspace === "Platform admin" ? copy.admin : copy.forwarder}</p></div>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/" className="hidden items-center gap-1 text-sm font-medium text-slate-600 hover:text-ocean sm:flex">{copy.publicDirectory} <ArrowUpRight size={14} /></Link>
        <span className="hidden max-w-[220px] truncate border-l border-line pl-4 text-xs text-slate-500 md:block">{email}</span>
        <LanguageToggle locale={locale} />
        {demo ? <Link href="/login" className="text-xs font-medium text-ocean">{copy.backToLogin}</Link> : <form action={signOutAction}><button aria-label={copy.signOut} title={copy.signOut} className="grid size-9 place-items-center rounded-sm border border-line text-slate-600 transition hover:border-ocean hover:text-ocean"><LogOut size={16} /></button></form>}
      </div>
    </div>
  </header>;
}
