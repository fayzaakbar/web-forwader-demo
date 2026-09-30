import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BadgeCheck, Globe2, Mail, MapPin, MessageCircle } from "lucide-react";
import { ProfileSections } from "@/components/ProfileSections";
import { getForwarderBySlug } from "@/lib/data";
import { getSafeHttpUrl } from "@/lib/forwarder-utils";
import { getLocale, messages } from "@/lib/i18n";

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const forwarder = await getForwarderBySlug(slug);
  if (!forwarder) return { title: "Forwarder not found" };
  return {
    title: forwarder.name,
    description: forwarder.description.slice(0, 160),
    openGraph: {
      title: forwarder.name,
      description: forwarder.description.slice(0, 160),
      images: forwarder.banner_image_url ? [forwarder.banner_image_url] : [],
    },
  };
}

export default async function ForwarderProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const forwarder = await getForwarderBySlug(slug);
  if (!forwarder) notFound();
  const locale = await getLocale();
  const copy = messages[locale];

  const primaryContact = forwarder.company_contacts[0];
  const website = getSafeHttpUrl(forwarder.website);
  const profilePdf = getSafeHttpUrl(forwarder.company_profile_pdf_url);
  const whatsapp = primaryContact?.whatsapp?.replace(/\D/g, "");

  return <article className="mx-auto max-w-[1400px] px-5 pb-16 sm:px-8 lg:px-12">
    <Link href="/" className="inline-flex items-center gap-2 py-5 text-sm font-medium text-slate-500 transition hover:text-ink"><ArrowLeft size={16} /> {copy.backToDirectory}</Link>

    <section className="relative overflow-hidden rounded-sm bg-ink">
      <div className="relative h-[230px] sm:h-[310px] lg:h-[360px]">
        {forwarder.banner_image_url && <Image src={forwarder.banner_image_url} alt={`${forwarder.name} operations`} fill priority sizes="100vw" className="object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/45 to-ink/10" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink/50 to-transparent" />
        <div className="absolute bottom-5 left-5 flex items-end gap-4 sm:bottom-7 sm:left-8 sm:gap-5 lg:left-10">
          <div className="relative grid size-[82px] shrink-0 place-items-center overflow-hidden rounded-md border-4 border-white bg-[#e9f1f2] font-display text-2xl font-semibold text-ink shadow-md sm:size-[104px]">
            {forwarder.logo_url ? <Image src={forwarder.logo_url} alt={`${forwarder.name} logo`} fill sizes="104px" className="object-contain p-1" /> : initials(forwarder.name)}
          </div>
          <div className="pb-1 text-white">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {forwarder.verified_status === "verified" && <span className="inline-flex items-center gap-1.5 rounded-sm bg-white px-2.5 py-1 text-[11px] font-semibold text-ocean"><BadgeCheck size={14} /> Verified company</span>}
              <span className="inline-flex items-center gap-1.5 text-xs text-white/85"><MapPin size={13} />{[forwarder.headquarters_city, forwarder.headquarters_country].filter(Boolean).join(", ")}</span>
            </div>
            <h1 className="max-w-3xl font-display text-[27px] font-semibold leading-tight tracking-[-0.025em] sm:text-[36px]">{forwarder.name}</h1>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-white/10 bg-ink px-4 py-3 sm:justify-end sm:px-7">
        {primaryContact?.email && <a href={`mailto:${primaryContact.email}`} className="inline-flex h-9 items-center gap-2 rounded-sm border border-white/20 px-3 text-xs font-semibold text-white transition hover:border-white/50 hover:bg-white/5"><Mail size={14} /> {copy.emailAction}</a>}
        {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-sm border border-white/20 px-3 text-xs font-semibold text-white transition hover:border-white/50 hover:bg-white/5"><MessageCircle size={14} /> {copy.whatsappAction}</a>}
        {website && <a href={website} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-sm border border-white/20 px-3 text-xs font-semibold text-white transition hover:border-white/50 hover:bg-white/5"><Globe2 size={14} /> {copy.websiteAction} <ArrowUpRight size={13} /></a>}
        {profilePdf && <a href={profilePdf} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-sm bg-white px-3 text-xs font-semibold text-ink transition hover:bg-slate-100"><ArrowUpRight size={14} /> {copy.companyPdf}</a>}
      </div>
    </section>

    <ProfileSections forwarder={forwarder} locale={locale} />
  </article>;
}
