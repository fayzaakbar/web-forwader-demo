import Link from "next/link";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { messages, type Locale } from "@/lib/i18n";

export function RoleAccessPanel({
  role,
  locale,
  demo,
  enabled,
}: {
  role: "admin" | "forwarder";
  locale: Locale;
  demo: boolean;
  enabled: boolean;
}) {
  const copy = messages[locale];
  const title = role === "admin" ? copy.adminLogin : copy.forwarderLogin;
  const destination = role === "admin" ? "/admin" : "/forwarder";

  return <section aria-labelledby="role-access-title" className="mx-auto max-w-[600px] px-5 py-12 sm:px-8 sm:py-20">
    <div className="border-y border-line py-8 sm:py-10">
      <div className="mb-7 flex items-center justify-between"><Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-ink"><ArrowLeft size={15} />{copy.backToLogin}</Link><LanguageToggle locale={locale} /></div>
      <span className="grid size-11 place-items-center rounded-sm bg-[#eaf1f3] text-ocean"><LockKeyhole size={20} /></span>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.13em] text-ocean">{demo ? copy.demoWorkspace : copy.workspace}</p>
      <h1 id="role-access-title" className="mt-2 font-display text-3xl font-semibold text-ink">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">{demo ? copy.demoOnly : enabled ? copy.chooseWorkspaceHint : copy.accessDisabled}</p>
      {demo ? <Link href={destination} className="mt-6 inline-flex h-11 items-center gap-2 rounded-sm bg-ink px-4 text-sm font-semibold text-white hover:bg-[#183b59]">{copy.enterDemo} <ArrowRight size={15} /></Link>
        : enabled ? null : <Link href="/" className="mt-6 inline-flex h-10 items-center gap-2 rounded-sm border border-line px-4 text-sm font-semibold text-ink hover:border-ocean hover:text-ocean">{copy.backToDirectory}</Link>}
      {role === "forwarder" && <p className="mt-7 border-t border-line pt-5 text-sm text-slate-600">{copy.noAccount} <Link href="/forwarder/register" className="font-semibold text-ocean hover:underline">{copy.signUp}</Link></p>}
      <Link href="/" className="mt-7 inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-ocean"><ArrowLeft size={13} />{copy.backToDirectory}</Link>
    </div>
  </section>;
}
