import Link from "next/link";
import { BadgeCheck, Building2, Clock3, ShieldCheck } from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { updateCompanyVerification } from "@/app/admin/actions";
import { requirePlatformAdmin } from "@/lib/auth";
import { demoForwarders } from "@/lib/data";
import { getLocale, messages } from "@/lib/i18n";
import { isDemoRolePreview } from "@/lib/workspaces";
import type { CompanyRecord } from "@/types/database";

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const demo = isDemoRolePreview();
  const params = await searchParams;
  const locale = await getLocale();
  const copy = messages[locale];
  let email = "demo-admin@routewise.local";
  let companies: CompanyRecord[];
  let error = false;
  if (demo) {
    companies = demoForwarders;
  } else {
    const { supabase, user } = await requirePlatformAdmin();
    email = user.email ?? "";
    const result = await supabase.from("companies").select("*").order("created_at", { ascending: false });
    companies = (result.data ?? []) as unknown as CompanyRecord[];
    error = Boolean(result.error);
  }
  const pending = companies.filter((company) => company.verified_status === "pending").length;
  const verified = companies.filter((company) => company.verified_status === "verified").length;

  return <>
    <DashboardHeader workspace="Platform admin" email={email} demo={demo} />
    <section aria-labelledby="admin-title" className="mx-auto max-w-[1400px] px-5 pb-16 pt-9 sm:px-8 lg:px-12">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-ocean">{copy.admin}</p><h1 id="admin-title" className="mt-1.5 font-display text-3xl font-semibold text-ink">{copy.companyReview}</h1><p className="mt-2 text-sm text-slate-500">{copy.reviewHint}</p></div>
        <p className="inline-flex items-center gap-2 text-xs text-slate-500"><ShieldCheck size={15} className="text-ocean" /> {copy.admin}</p>
      </div>

      {demo && <p className="mb-5 border-l-2 border-ocean bg-[#f2f7f7] px-4 py-3 text-sm text-slate-600">{copy.changesNotSaved}</p>}
      {params.error && <p role="alert" className="mb-5 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{params.error === "server-config" ? "SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di server." : "Status perusahaan gagal diperbarui. Periksa konfigurasi dan coba lagi."}</p>}
      {error && <p role="alert" className="mb-5 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">Data perusahaan gagal dimuat. Pastikan migration sudah diterapkan.</p>}

      <section aria-label="Directory totals" className="mb-8 grid grid-cols-1 border-y border-line sm:grid-cols-3">
        <div className="flex items-center gap-3 py-5 sm:border-r sm:border-line sm:pr-5"><span className="grid size-10 place-items-center rounded-sm bg-slate-100 text-ink"><Building2 size={18} /></span><div><p className="text-xs text-slate-500">{copy.allCompanies}</p><p className="mt-0.5 text-xl font-semibold text-ink">{companies.length}</p></div></div>
        <div className="flex items-center gap-3 border-t border-line py-5 sm:border-0 sm:px-6"><span className="grid size-10 place-items-center rounded-sm bg-amber-50 text-amber-700"><Clock3 size={18} /></span><div><p className="text-xs text-slate-500">{copy.awaitingReview}</p><p className="mt-0.5 text-xl font-semibold text-ink">{pending}</p></div></div>
        <div className="flex items-center gap-3 border-t border-line py-5 sm:border-0 sm:border-l sm:pl-6"><span className="grid size-10 place-items-center rounded-sm bg-[#eaf4f3] text-ocean"><BadgeCheck size={18} /></span><div><p className="text-xs text-slate-500">{copy.verified}</p><p className="mt-0.5 text-xl font-semibold text-ink">{verified}</p></div></div>
      </section>

      <div className="mb-3 flex items-center justify-between"><h2 className="font-display text-lg font-semibold text-ink">{copy.directoryCompanies}</h2><span className="text-xs text-slate-500">{companies.length} {copy.records}</span></div>
      {companies.length ? <div className="overflow-x-auto border-y border-line bg-white"><table className="w-full min-w-[780px] text-left text-sm">
        <thead><tr className="border-b border-line bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><th className="px-4 py-3 font-semibold">{copy.company}</th><th className="px-4 py-3 font-semibold">{copy.listing}</th><th className="px-4 py-3 font-semibold">{copy.verification}</th><th className="px-4 py-3 font-semibold">{copy.reviewAction}</th></tr></thead>
        <tbody>{companies.map((company) => <tr key={company.id} className="border-b border-slate-100 last:border-0">
          <td className="px-4 py-4"><p className="font-semibold text-ink">{company.name}</p><p className="mt-1 text-xs text-slate-500">{[company.headquarters_city, company.headquarters_country].filter(Boolean).join(", ") || company.slug}</p></td>
          <td className="px-4 py-4"><span className={`rounded-sm px-2 py-1 text-xs font-medium ${company.status === "published" ? "bg-[#eaf4f3] text-ocean" : "bg-slate-100 text-slate-600"}`}>{company.status}</span>{company.status === "published" && <Link href={`/forwarders/${company.slug}`} target="_blank" className="ml-2 text-xs text-slate-500 underline-offset-2 hover:text-ocean hover:underline">Preview</Link>}</td>
          <td className="px-4 py-4"><span className="text-sm text-slate-700">{company.verified_status}</span></td>
          <td className="px-4 py-4">{demo ? <span className="text-xs text-slate-400">{copy.changesNotSaved}</span> : <form action={updateCompanyVerification} className="flex items-center gap-2"><input type="hidden" name="company_id" value={company.id} /><label className="sr-only" htmlFor={`status-${company.id}`}>{copy.verification} {company.name}</label><select id={`status-${company.id}`} name="verified_status" defaultValue={company.verified_status} className="h-9 rounded-sm border-line py-1 text-xs focus:border-ocean focus:ring-ocean"><option value="pending">Pending</option><option value="verified">Verified</option><option value="rejected">Rejected</option></select><button className="h-9 rounded-sm bg-ink px-3 text-xs font-semibold text-white hover:bg-[#183b59]">{copy.save}</button></form>}</td>
        </tr>)}</tbody>
      </table></div> : <p className="border-y border-line py-10 text-center text-sm text-slate-500">{copy.noCompanies}</p>}
    </section>
  </>;
}
