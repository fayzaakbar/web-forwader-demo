import Link from "next/link";
import { ArrowLeft, BadgeCheck, ExternalLink } from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ForwarderProfileEditor } from "@/components/ForwarderProfileEditor";
import { requireForwarderCompany } from "@/lib/auth";
import { demoForwarders, getAllServiceCategories } from "@/lib/data";
import { getLocale, messages } from "@/lib/i18n";
import { isDemoForwarderPreview } from "@/lib/workspaces";
import type { CompanyContactRecord, CompanyGalleryRecord, CompanyMemberRole, CompanyRecord, CompanyServiceRecord, Forwarder, ServiceAreaRecord, ServiceCategoryRecord } from "@/types/database";

type EditorProps = { params: Promise<{ id: string }> };

export default async function ForwarderCompanyEditor({ params }: EditorProps) {
  const { id } = await params;
  const demo = isDemoForwarderPreview();
  const locale = await getLocale();
  const copy = messages[locale];
  let company: CompanyRecord;
  let role: CompanyMemberRole;
  let email = "demo-forwarder@routewise.local";
  let services: CompanyServiceRecord[];
  let areas: ServiceAreaRecord[];
  let contacts: CompanyContactRecord[];
  let gallery: CompanyGalleryRecord[];
  let categories: ServiceCategoryRecord[];

  if (demo) {
    const demoCompany = demoForwarders.find((item) => item.id === id);
    if (!demoCompany) return <section className="mx-auto max-w-3xl px-5 py-16 text-sm text-slate-600">Demo company not found.</section>;
    company = demoCompany;
    role = "owner";
    services = demoCompany.company_services;
    areas = demoCompany.service_areas;
    contacts = demoCompany.company_contacts;
    gallery = demoCompany.company_gallery;
    categories = getAllServiceCategories([demoCompany]);
  } else {
    const result = await requireForwarderCompany(id);
    company = result.company;
    role = result.membership.role;
    email = result.user.email ?? "";
    const [serviceResult, areaResult, contactResult, galleryResult, categoryResult] = await Promise.all([
      result.supabase.from("company_services").select("*").eq("company_id", id),
      result.supabase.from("service_areas").select("*").eq("company_id", id),
      result.supabase.from("company_contacts").select("*").eq("company_id", id).order("is_primary", { ascending: false }),
      result.supabase.from("company_gallery").select("*").eq("company_id", id).order("sort_order"),
      result.supabase.from("service_categories").select("*").order("name"),
    ]);
    categories = (categoryResult.data ?? []) as unknown as ServiceCategoryRecord[];
    const categoryById = new Map(categories.map((category) => [category.id, category]));
    services = ((serviceResult.data ?? []) as unknown as CompanyServiceRecord[]).map((service) => ({
      ...service,
      service_categories: categoryById.get(service.category_id) ?? null,
    }));
    areas = (areaResult.data ?? []) as unknown as ServiceAreaRecord[];
    contacts = (contactResult.data ?? []) as unknown as CompanyContactRecord[];
    gallery = (galleryResult.data ?? []) as unknown as CompanyGalleryRecord[];
  }

  const publicUrl = company.status === "published" ? `/forwarders/${company.slug}` : null;
  return <>
    <DashboardHeader workspace="Forwarder workspace" email={email} demo={demo} />
    <section aria-labelledby="company-editor-title" className="mx-auto max-w-[1100px] px-5 pb-16 pt-8 sm:px-8 lg:px-12">
      <Link href="/forwarder" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-ink"><ArrowLeft size={15} /> {copy.forwarderProfiles}</Link>
      <div className="mb-6 mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-ocean">{role} · {demo ? copy.demoWorkspace : copy.forwarder}</p><h1 id="company-editor-title" className="mt-1.5 font-display text-3xl font-semibold text-ink">{copy.editCompany}</h1><p className="mt-2 text-sm text-slate-500">{company.name}</p></div>{publicUrl && <Link href={publicUrl} target="_blank" className="inline-flex h-10 items-center gap-2 self-start rounded-sm border border-line px-3.5 text-sm font-semibold text-ink hover:border-ocean hover:text-ocean sm:self-auto">{copy.preview} <ExternalLink size={14} /></Link>}</div>
      <div className="mb-5 flex flex-wrap gap-2 text-xs"><span className="rounded-sm bg-slate-100 px-2.5 py-1.5 capitalize text-slate-600">{copy.listingStatus}: {company.status}</span><span className="inline-flex items-center gap-1.5 rounded-sm bg-[#eaf4f3] px-2.5 py-1.5 text-ocean">{company.verified_status === "verified" && <BadgeCheck size={13} />}{copy.verificationStatus}: {company.verified_status}</span></div>
      {demo && <p className="mb-5 border-l-2 border-ocean bg-[#f2f7f7] px-4 py-3 text-sm text-slate-600">{copy.changesNotSaved}</p>}
      <ForwarderProfileEditor company={company} services={services} areas={areas} contacts={contacts} gallery={gallery} categories={categories} locale={locale} demo={demo} />
      <p className="mt-6 text-xs leading-5 text-slate-500">{copy.roleNotice}</p>
    </section>
  </>;
}
