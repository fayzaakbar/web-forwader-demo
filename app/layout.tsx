import type { Metadata } from "next";
import Link from "next/link";
import { Anchor, ArrowUpRight } from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { getLocale, messages } from "@/lib/i18n";
import { areWorkspacesEnabled, isDemoRolePreview } from "@/lib/workspaces";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Routewise | Freight forwarding directory", template: "%s | Routewise" },
  description: "Discover freight forwarding companies by capability, service area and trade lane.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const copy = messages[locale];
  const showWorkspaceLink = areWorkspacesEnabled() || isDemoRolePreview();
  return <html lang={locale} data-scroll-behavior="smooth"><body>
    <header className="relative z-20 border-b border-line bg-white">
      <div className="mx-auto flex h-[68px] max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Routewise home">
          <span className="grid size-8 place-items-center rounded-sm bg-ink text-white"><Anchor size={18} strokeWidth={2.2} /></span>
          <span className="font-display text-[19px] font-bold tracking-[-0.03em] text-ink">routewise<span className="text-ocean">.</span></span>
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-5 sm:gap-8">
          <Link href="/" className="text-sm font-medium text-ink">{copy.directory}</Link>
          {showWorkspaceLink && <Link href="/login" className="text-sm font-medium text-slate-600 transition hover:text-ocean">{isDemoRolePreview() ? copy.demoAccess : copy.workspace}</Link>}
          {process.env.NEXT_PUBLIC_PARTNERSHIPS_EMAIL && <a href={`mailto:${process.env.NEXT_PUBLIC_PARTNERSHIPS_EMAIL}`} className="inline-flex h-9 items-center gap-1.5 rounded-sm bg-ink px-3.5 text-xs font-semibold text-white transition hover:bg-[#183b59] sm:h-10 sm:px-4 sm:text-sm">List your company <ArrowUpRight size={14} /></a>}
          <LanguageToggle locale={locale} />
        </nav>
      </div>
    </header>
    <main>{children}</main>
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <p>© {new Date().getFullYear()} Routewise. A clearer view of global logistics.</p>
        <p>{copy.footerNote}</p>
      </div>
    </footer>
  </body></html>;
}
