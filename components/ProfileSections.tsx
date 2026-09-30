"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { BadgeCheck, Globe2, Mail, MapPin, Phone, Ship } from "lucide-react";
import { CompanyGallery } from "@/components/CompanyGallery";
import { ProfileDocument } from "@/components/ProfileDocument";
import { getServiceNames } from "@/lib/forwarder-utils";
import { messages, translateService, type Locale } from "@/lib/messages";
import type { Forwarder } from "@/types/database";

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div className="mb-5"><p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-ocean">{eyebrow}</p><h2 className="mt-1 font-display text-xl font-semibold text-ink">{title}</h2></div>;
}

export function ProfileSections({ forwarder, locale }: { forwarder: Forwarder; locale: Locale }) {
  const copy = messages[locale];
  const tabItems = [
    { value: "overview", label: copy.overviewTab },
    { value: "services", label: copy.servicesTab },
    { value: "coverage", label: copy.coverageTab },
    { value: "gallery", label: copy.galleryTab },
    { value: "documents", label: copy.documentsTab },
    { value: "contacts", label: copy.contactsTab },
  ];
  const services = forwarder.company_services;

  return (
    <Tabs.Root defaultValue="overview" className="mt-9">
      <Tabs.List aria-label={`${forwarder.name} ${copy.profileSections}`} className="profile-tabs flex gap-1 overflow-x-auto border-b border-line">
        {tabItems.map((tab) => <Tabs.Trigger key={tab.value} value={tab.value} className="shrink-0 border-b-2 border-transparent px-3 py-3 text-sm font-medium text-slate-500 transition hover:text-ink data-[state=active]:border-ocean data-[state=active]:text-ink sm:px-4">{tab.label}</Tabs.Trigger>)}
      </Tabs.List>

      <Tabs.Content value="overview" className="profile-tab-content grid gap-10 py-8 outline-none lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <SectionHeading eyebrow={copy.companyProfile} title={copy.builtForLogistics} />
          <p className="max-w-3xl whitespace-pre-line text-[15px] leading-7 text-slate-600">{forwarder.description || copy.noDescription}</p>
          <div className="mt-7 flex flex-wrap gap-2">{getServiceNames(forwarder).map((name) => <span key={name} className="rounded-sm border border-line bg-white px-3 py-2 text-sm text-slate-700">{translateService(name, locale)}</span>)}</div>
        </div>
        <aside className="border-l border-line pl-0 lg:pl-7">
          <SectionHeading eyebrow={copy.atAGlance} title={copy.companyDetails} />
          <dl className="space-y-4 text-sm">
            <div><dt className="text-xs text-slate-500">{copy.headquarters}</dt><dd className="mt-1 flex items-center gap-2 font-medium text-ink"><MapPin size={15} className="text-ocean" />{[forwarder.headquarters_city, forwarder.headquarters_country].filter(Boolean).join(", ") || copy.locationMissing}</dd></div>
            <div><dt className="text-xs text-slate-500">{copy.servicesLabel}</dt><dd className="mt-1 font-medium text-ink">{services.length} {copy.capabilities}</dd></div>
            <div><dt className="text-xs text-slate-500">{copy.tradeLanes}</dt><dd className="mt-1 font-medium text-ink">{forwarder.service_areas.length} {copy.routes}</dd></div>
            <div><dt className="text-xs text-slate-500">{copy.directoryStatus}</dt><dd className="mt-1 flex items-center gap-1.5 font-medium text-ink">{forwarder.verified_status === "verified" ? <><BadgeCheck size={16} className="text-ocean" /> {copy.independentlyVerified}</> : copy.profileListed}</dd></div>
          </dl>
        </aside>
      </Tabs.Content>

      <Tabs.Content value="services" className="profile-tab-content py-8 outline-none">
        <SectionHeading eyebrow={copy.whatTheyDo} title={copy.scopeOfServices} />
        {services.length > 0 ? <div className="divide-y divide-line border-y border-line">
          {services.map((service) => <article key={service.id} className="grid gap-3 py-5 sm:grid-cols-[210px_minmax(0,1fr)] sm:gap-8">
            <div><p className="flex items-center gap-2 font-semibold text-ink"><Ship size={16} className="text-ocean" />{service.service_categories ? translateService(service.service_categories.name, locale) : copy.servicesLabel}</p></div>
            <div><p className="text-sm leading-6 text-slate-600">{service.description}</p>{service.scope_of_work.length > 0 && <ul className="mt-3 flex flex-wrap gap-2">{service.scope_of_work.map((scope) => <li key={scope} className="rounded-sm bg-slate-100 px-2.5 py-1.5 text-xs text-slate-600">{scope}</li>)}</ul>}</div>
          </article>)}
        </div> : <p className="border-y border-line py-8 text-sm text-slate-500">{copy.noServices}</p>}
      </Tabs.Content>

      <Tabs.Content value="coverage" className="profile-tab-content py-8 outline-none">
        <SectionHeading eyebrow={copy.whereTheyOperate} title={copy.coverageAreas} />
        {forwarder.service_areas.length > 0 ? <div className="overflow-x-auto border-y border-line"><table className="w-full min-w-[600px] text-left text-sm"><thead><tr className="border-b border-line text-xs uppercase tracking-wide text-slate-500"><th className="py-3 pr-5 font-semibold">{copy.origin}</th><th className="py-3 pr-5 font-semibold">{copy.destination}</th><th className="py-3 font-semibold">{copy.laneType}</th></tr></thead><tbody>{forwarder.service_areas.map((area) => <tr key={area.id} className="border-b border-slate-100 last:border-0"><td className="py-4 pr-5 font-medium text-ink">{[area.origin_region, area.origin_country].filter(Boolean).join(", ")}</td><td className="py-4 pr-5 text-slate-600">{[area.destination_region, area.destination_country].filter(Boolean).join(", ")}</td><td className="py-4 text-slate-600">{area.is_domestic ? copy.domestic : copy.international}</td></tr>)}</tbody></table></div> : <p className="border-y border-line py-8 text-sm text-slate-500">{copy.noCoverage}</p>}
      </Tabs.Content>

      <Tabs.Content value="gallery" className="profile-tab-content py-8 outline-none">
        <SectionHeading eyebrow={copy.onTheGround} title={copy.operationalGallery} />
        <CompanyGallery images={forwarder.company_gallery} />
      </Tabs.Content>

      <Tabs.Content value="documents" className="profile-tab-content py-8 outline-none">
        <SectionHeading eyebrow={copy.companyInformation} title={copy.companyDocuments} />
        <ProfileDocument url={forwarder.company_profile_pdf_url} companyName={forwarder.name} locale={locale} />
      </Tabs.Content>

      <Tabs.Content value="contacts" className="profile-tab-content py-8 outline-none">
        <SectionHeading eyebrow={copy.startConversation} title={copy.contactPICs} />
        {forwarder.company_contacts.length > 0 ? <div className="grid gap-4 sm:grid-cols-2">{forwarder.company_contacts.map((contact) => <article key={contact.id} className="border-y border-line py-5">
          <div className="flex items-start gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[#eaf1f3] font-semibold text-ocean">{contact.pic_name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</div>
            <div className="min-w-0"><p className="font-semibold text-ink">{contact.pic_name}{contact.is_primary && <span className="ml-2 rounded-sm bg-[#eaf4f3] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-ocean">{copy.primaryContact}</span>}</p><p className="mt-1 text-sm text-slate-500">{contact.pic_role || copy.companyRepresentative}</p><a href={`mailto:${contact.email}`} className="mt-3 flex items-center gap-2 break-all text-sm font-medium text-ocean hover:underline"><Mail size={14} className="shrink-0" />{contact.email}</a>{contact.phone && <a href={`tel:${contact.phone}`} className="mt-2 flex items-center gap-2 text-sm text-slate-600 hover:text-ink"><Phone size={14} />{contact.phone}</a>}</div>
          </div>
        </article>)}</div> : <p className="border-y border-line py-8 text-sm text-slate-500">{copy.noContacts}</p>}
        <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-slate-500"><Globe2 size={14} className="mt-0.5 shrink-0" />{copy.contactDisclosure}</p>
      </Tabs.Content>
    </Tabs.Root>
  );
}
