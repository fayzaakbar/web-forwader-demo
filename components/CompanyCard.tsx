import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Globe2, MapPin, MessageCircle, Send } from "lucide-react";
import { getCoverageLabels, getServiceNames } from "@/lib/forwarder-utils";
import { messages, translateService, type Locale } from "@/lib/messages";
import type { Forwarder } from "@/types/database";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function CompanyCard({ forwarder, locale }: { forwarder: Forwarder; locale: Locale }) {
  const copy = messages[locale];
  const contact = forwarder.company_contacts[0];
  const services = getServiceNames(forwarder).map((name) => translateService(name, locale));
  const coverage = getCoverageLabels(forwarder);

  return (
    <article className="company-card group overflow-hidden rounded-md border border-line bg-white transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-soft">
      <Link href={`/forwarders/${forwarder.slug}`} aria-label={`View ${forwarder.name} profile`} className="block">
        <div className="relative h-36 overflow-hidden bg-slate-200">
          {forwarder.banner_image_url ? (
            <Image
              src={forwarder.banner_image_url}
              alt={`${forwarder.name} freight operations`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 380px"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="h-full bg-[linear-gradient(120deg,#dce8eb,#a8c3c8)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/35 to-transparent" />
          <div className="absolute -bottom-7 left-5 grid size-[68px] place-items-center rounded-md border-4 border-white bg-[#e9f1f2] font-display text-lg font-semibold text-ink shadow-sm">
            {forwarder.logo_url ? (
              <Image src={forwarder.logo_url} alt={`${forwarder.name} logo`} fill sizes="68px" className="rounded object-contain p-1" />
            ) : initials(forwarder.name)}
          </div>
          {forwarder.verified_status === "verified" && (
            <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-sm border border-white/60 bg-white/95 px-2.5 py-1 text-xs font-semibold text-ocean shadow-sm">
              <BadgeCheck size={14} aria-hidden="true" /> {copy.verifiedFilter}
            </span>
          )}
        </div>
        <div className="px-5 pb-0 pt-10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-[17px] font-semibold leading-snug text-ink group-hover:text-ocean">{forwarder.name}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin size={14} aria-hidden="true" />
                {[forwarder.headquarters_city, forwarder.headquarters_country].filter(Boolean).join(", ") || copy.locationMissing}
              </p>
            </div>
            <ArrowUpRight size={17} className="mt-1 shrink-0 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ocean" aria-hidden="true" />
          </div>
        </div>
      </Link>

      <div className="px-5 pb-5 pt-4">
        <div className="flex min-h-7 flex-wrap gap-1.5">
          {services.slice(0, 3).map((service) => (
            <span key={service} className="rounded-sm bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">{service}</span>
          ))}
          {services.length > 3 && <span className="px-1 py-1 text-[11px] text-slate-500">+{services.length - 3}</span>}
        </div>
        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3.5">
          <Globe2 size={14} className="shrink-0 text-ocean" aria-hidden="true" />
          <p className="min-w-0 truncate text-xs text-slate-500">
            {coverage.length > 0 ? coverage.slice(0, 3).join(" · ") : copy.coverageDetails}
            {coverage.length > 3 ? ` +${coverage.length - 3}` : ""}
          </p>
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            {contact?.email && (
              <a href={`mailto:${contact.email}`} aria-label={`Email ${contact.pic_name}`} title="Email contact" onClick={(event) => event.stopPropagation()} className="grid size-8 place-items-center rounded-sm border border-line text-slate-600 transition hover:border-ocean hover:text-ocean">
                <Send size={14} aria-hidden="true" />
              </a>
            )}
            {contact?.whatsapp && (
              <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${contact.pic_name}`} title="WhatsApp contact" onClick={(event) => event.stopPropagation()} className="grid size-8 place-items-center rounded-sm border border-line text-slate-600 transition hover:border-ocean hover:text-ocean">
                <MessageCircle size={15} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
