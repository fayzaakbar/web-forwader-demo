import Link from "next/link";
import { ArrowRight, Building2, ShieldCheck } from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { RoleAccessPanel } from "@/components/RoleAccessPanel";
import { getLocale, messages } from "@/lib/i18n";
import { areWorkspacesEnabled, isDemoRolePreview } from "@/lib/workspaces";

export default async function LoginChooserPage() {
  const locale = await getLocale();
  const copy = messages[locale];
  const demo = isDemoRolePreview();
  const enabled = areWorkspacesEnabled();

  if (!demo && !enabled) return <RoleAccessPanel role="admin" locale={locale} demo={false} enabled={false} />;

  return <section aria-labelledby="workspace-choice-title" className="mx-auto max-w-[900px] px-5 py-12 sm:px-8 sm:py-20">
    <div className="mb-8 flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-ocean">{demo ? copy.demoWorkspace : copy.workspace}</p><h1 id="workspace-choice-title" className="mt-2 font-display text-3xl font-semibold text-ink">{copy.chooseWorkspace}</h1><p className="mt-2 text-sm text-slate-500">{copy.chooseWorkspaceHint}</p></div><LanguageToggle locale={locale} /></div>
    {demo && <p className="mb-6 border-l-2 border-ocean bg-[#f2f7f7] px-4 py-3 text-sm text-slate-600">{copy.demoOnly}</p>}
    <div className="grid gap-0 border-y border-line md:grid-cols-2 md:divide-x md:divide-line">
      <article className="py-6 md:pr-7"><span className="grid size-11 place-items-center rounded-sm bg-[#eaf1f3] text-ocean"><ShieldCheck size={20} /></span><h2 className="mt-4 font-display text-xl font-semibold text-ink">{copy.admin}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{copy.companyReview}</p><Link href="/admin/login" className="mt-5 inline-flex h-10 items-center gap-2 rounded-sm bg-ink px-4 text-sm font-semibold text-white hover:bg-[#183b59]">{demo ? copy.enterDemo : copy.signIn} <ArrowRight size={15} /></Link></article>
      <article className="border-t border-line py-6 md:border-t-0 md:pl-7"><span className="grid size-11 place-items-center rounded-sm bg-[#eaf1f3] text-ocean"><Building2 size={20} /></span><h2 className="mt-4 font-display text-xl font-semibold text-ink">{copy.forwarder}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{copy.manageCompanyHint}</p><div className="mt-5 flex flex-wrap gap-3"><Link href="/forwarder/login" className="inline-flex h-10 items-center gap-2 rounded-sm bg-ink px-4 text-sm font-semibold text-white hover:bg-[#183b59]">{demo ? copy.enterDemo : copy.signIn} <ArrowRight size={15} /></Link><Link href="/forwarder/register" className="inline-flex h-10 items-center rounded-sm border border-line px-4 text-sm font-semibold text-ink hover:border-ocean hover:text-ocean">{copy.signUp}</Link></div></article>
    </div>
  </section>;
}
