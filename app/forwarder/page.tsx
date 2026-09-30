import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Building2, MapPin } from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { requireForwarderMemberships } from "@/lib/auth";
import { demoForwarders } from "@/lib/data";
import { getLocale, messages } from "@/lib/i18n";
import { isDemoRolePreview } from "@/lib/workspaces";
import type { CompanyRecord } from "@/types/database";

export default async function ForwarderDashboard() {
  const demo = isDemoRolePreview();
  const locale = await getLocale();
  const copy = messages[locale];
  const demoCompany = demoForwarders.find((company) => company.slug === "harborlight-freight-demo") ?? demoForwarders[0];
  let email = "demo-forwarder@routewise.local";
  let memberships: { company: CompanyRecord; role: string }[];
  if (demo) memberships = [{ company: demoCompany, role: "owner" }];
  else {
    const result = await requireForwarderMemberships();
    email = result.user.email ?? "";
    memberships = result.memberships;
  }

  return <>
    <DashboardHeader workspace="Forwarder workspace" email={email} demo={demo} />
    <section aria-labelledby="forwarder-title" className="mx-auto max-w-[1200px] px-5 pb-16 pt-9 sm:px-8 lg:px-12">
      <div className="mb-8"><p className="text-xs font-semibold uppercase tracking-[0.13em] text-ocean">{copy.companyWorkspace}</p><h1 id="forwarder-title" className="mt-1.5 font-display text-3xl font-semibold text-ink">{copy.forwarderProfiles}</h1><p className="mt-2 text-sm text-slate-500">{copy.manageCompanyHint}</p></div>
      {demo && <p className="mb-5 border-l-2 border-ocean bg-[#f2f7f7] px-4 py-3 text-sm text-slate-600">{copy.changesNotSaved}</p>}
      <section aria-label="Your companies" className="divide-y divide-line border-y border-line">
        {memberships.map(({ company, role }) => <article key={company.id} className="flex flex-col gap-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-sm bg-[#eaf1f3] text-ocean"><Building2 size={19} /></span>
            <div className="min-w-0"><h2 className="truncate font-display text-lg font-semibold text-ink">{company.name}</h2><p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><MapPin size={14} />{[company.headquarters_city, company.headquarters_country].filter(Boolean).join(", ") || copy.locationMissing}</p><div className="mt-2 flex flex-wrap items-center gap-2"><span className="rounded-sm bg-slate-100 px-2 py-1 text-[11px] font-medium capitalize text-slate-600">{role}</span><span className={`rounded-sm px-2 py-1 text-[11px] font-medium ${company.status === "published" ? "bg-[#eaf4f3] text-ocean" : "bg-amber-50 text-amber-800"}`}>{company.status}</span>{company.verified_status === "verified" && <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ocean"><BadgeCheck size={13} /> {copy.verified}</span>}</div></div>
          </div>
          <div className="flex shrink-0 gap-2 pl-14 sm:pl-0">
            <Link href={`/forwarder/companies/${company.id}`} className="inline-flex h-10 items-center gap-2 rounded-sm bg-ink px-3.5 text-sm font-semibold text-white hover:bg-[#183b59]">{copy.manageProfile}</Link>
            {company.status === "published" && <Link href={`/forwarders/${company.slug}`} target="_blank" aria-label={`View public profile for ${company.name}`} className="grid size-10 place-items-center rounded-sm border border-line text-slate-600 hover:border-ocean hover:text-ocean"><ArrowUpRight size={16} /></Link>}
          </div>
        </article>)}
      </section>
      <p className="mt-6 text-xs leading-5 text-slate-500">{copy.roleNotice}</p>
    </section>
  </>;
}
