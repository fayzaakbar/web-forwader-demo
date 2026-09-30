"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useActionState, useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AssetUploader } from "@/components/AssetUploader";
import { saveCompanyDetails, saveContacts, saveGallery, saveServicesAndAreas, type EditorActionState } from "@/app/forwarder/companies/[id]/actions";
import { messages, type Locale } from "@/lib/messages";
import type { CompanyContactRecord, CompanyGalleryRecord, CompanyRecord, CompanyServiceRecord, ServiceAreaRecord, ServiceCategoryRecord } from "@/types/database";

type Props = {
  company: CompanyRecord;
  services: CompanyServiceRecord[];
  areas: ServiceAreaRecord[];
  contacts: CompanyContactRecord[];
  gallery: CompanyGalleryRecord[];
  categories: ServiceCategoryRecord[];
  locale: Locale;
  demo: boolean;
};

type BasicDraft = Pick<CompanyRecord, "name" | "description" | "website" | "logo_url" | "banner_image_url" | "company_profile_pdf_url" | "headquarters_city" | "headquarters_country">;
const initialActionState: EditorActionState = { error: "", message: "" };
const inputClass = "h-11 w-full rounded-sm border-line text-sm focus:border-ocean focus:ring-ocean";
const areaClass = "w-full rounded-sm border-line text-sm leading-6 focus:border-ocean focus:ring-ocean";

function saveDemo(event: FormEvent<HTMLFormElement>, notify: (message: string) => void, message: string) {
  event.preventDefault();
  notify(message);
}

function ActionFeedback({ state }: { state: EditorActionState }) {
  if (state.error) return <p role="alert" className="mb-4 rounded-sm border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">{state.error}</p>;
  if (state.message) return <p role="status" className="mb-4 rounded-sm border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900">{state.message}</p>;
  return null;
}

export function ForwarderProfileEditor({ company, services: initialServices, areas: initialAreas, contacts: initialContacts, gallery: initialGallery, categories, locale, demo }: Props) {
  const copy = messages[locale];
  const [basic, setBasic] = useState<BasicDraft>({
    name: company.name,
    description: company.description,
    website: company.website,
    logo_url: company.logo_url,
    banner_image_url: company.banner_image_url,
    company_profile_pdf_url: company.company_profile_pdf_url,
    headquarters_city: company.headquarters_city,
    headquarters_country: company.headquarters_country,
  });
  const [services, setServices] = useState(initialServices);
  const [areas, setAreas] = useState(initialAreas);
  const [contacts, setContacts] = useState(initialContacts);
  const [gallery, setGallery] = useState(initialGallery);
  const [demoMessage, setDemoMessage] = useState("");
  const [profileState, profileAction, profilePending] = useActionState(saveCompanyDetails, initialActionState);
  const [servicesState, servicesAction, servicesPending] = useActionState(saveServicesAndAreas, initialActionState);
  const [contactsState, contactsAction, contactsPending] = useActionState(saveContacts, initialActionState);
  const [galleryState, galleryAction, galleryPending] = useActionState(saveGallery, initialActionState);

  function updateService(index: number, patch: Partial<CompanyServiceRecord>) {
    setServices((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }
  function updateArea(index: number, patch: Partial<ServiceAreaRecord>) {
    setAreas((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }
  function updateContact(index: number, patch: Partial<CompanyContactRecord>) {
    setContacts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : patch.is_primary ? { ...item, is_primary: false } : item));
  }
  function updateGallery(index: number, patch: Partial<CompanyGalleryRecord>) {
    setGallery((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }

  const tabItems = [
    { value: "profile", label: copy.profileTab },
    { value: "services", label: copy.servicesCoverageTab },
    { value: "contacts", label: copy.contactsTab },
    { value: "gallery", label: copy.galleryDocumentsTab },
  ];

  return <Tabs.Root defaultValue="profile" className="mt-7">
    <Tabs.List aria-label={copy.editorSections} className="profile-tabs flex gap-1 overflow-x-auto border-b border-line">
      {tabItems.map((tab) => <Tabs.Trigger key={tab.value} value={tab.value} className="shrink-0 border-b-2 border-transparent px-3 py-3 text-sm font-medium text-slate-500 transition hover:text-ink data-[state=active]:border-ocean data-[state=active]:text-ink sm:px-4">{tab.label}</Tabs.Trigger>)}
    </Tabs.List>

    <Tabs.Content value="profile" className="profile-tab-content py-6 outline-none">
      {demo && <p className="mb-5 border-l-2 border-ocean bg-[#f2f7f7] px-4 py-3 text-sm text-slate-600">{copy.changesNotSaved}</p>}
      <ActionFeedback state={demo ? { error: "", message: demoMessage } : profileState} />
      <form action={demo ? undefined : profileAction} onSubmit={demo ? (event) => saveDemo(event, setDemoMessage, copy.changesNotSaved) : undefined} className="space-y-5">
        <input type="hidden" name="company_id" value={company.id} />
        <input type="hidden" name="locale" value={locale} />
        <div><label htmlFor="company-name" className="mb-1.5 block text-sm font-semibold text-ink">{copy.companyName}</label><input id="company-name" name="name" required minLength={2} maxLength={160} value={basic.name} onChange={(event) => setBasic({ ...basic, name: event.target.value })} className={inputClass} /></div>
        <div><label htmlFor="company-description" className="mb-1.5 block text-sm font-semibold text-ink">{copy.companyDescription}</label><textarea id="company-description" name="description" maxLength={5000} rows={5} value={basic.description} onChange={(event) => setBasic({ ...basic, description: event.target.value })} className={areaClass} /></div>
        <div className="grid gap-5 md:grid-cols-2">
          <div><label htmlFor="company-website" className="mb-1.5 block text-sm font-semibold text-ink">{copy.website}</label><input id="company-website" name="website" type="url" placeholder="https://company.com" value={basic.website ?? ""} onChange={(event) => setBasic({ ...basic, website: event.target.value || null })} className={inputClass} /></div>
          <div><label htmlFor="company-pdf" className="mb-1.5 block text-sm font-semibold text-ink">{copy.companyPdfInput}</label><input id="company-pdf" name="company_profile_pdf_url" type="url" placeholder="https://.../profile.pdf" value={basic.company_profile_pdf_url ?? ""} onChange={(event) => setBasic({ ...basic, company_profile_pdf_url: event.target.value || null })} className={inputClass} /><div className="mt-2"><AssetUploader companyId={company.id} folder="documents" accept="application/pdf" demo={demo} locale={locale} onUploaded={(url) => setBasic((current) => ({ ...current, company_profile_pdf_url: url }))} /></div></div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div><label htmlFor="company-logo" className="mb-1.5 block text-sm font-semibold text-ink">{copy.companyLogo}</label><input id="company-logo" name="logo_url" type="url" placeholder="https://.../logo.png" value={basic.logo_url ?? ""} onChange={(event) => setBasic({ ...basic, logo_url: event.target.value || null })} className={inputClass} /><div className="mt-2"><AssetUploader companyId={company.id} folder="logos" accept="image/png,image/jpeg,image/webp,image/avif" demo={demo} locale={locale} onUploaded={(url) => setBasic((current) => ({ ...current, logo_url: url }))} /></div>{basic.logo_url && <div className="mt-3 grid size-16 place-items-center overflow-hidden rounded-sm border border-line bg-white"><img src={basic.logo_url} alt={copy.companyLogo} className="max-h-full max-w-full object-contain" /></div>}</div>
          <div><label htmlFor="company-banner" className="mb-1.5 block text-sm font-semibold text-ink">{copy.bannerImage}</label><input id="company-banner" name="banner_image_url" type="url" placeholder="https://.../banner.jpg" value={basic.banner_image_url ?? ""} onChange={(event) => setBasic({ ...basic, banner_image_url: event.target.value || null })} className={inputClass} /><div className="mt-2"><AssetUploader companyId={company.id} folder="banners" accept="image/png,image/jpeg,image/webp,image/avif" demo={demo} locale={locale} onUploaded={(url) => setBasic((current) => ({ ...current, banner_image_url: url }))} /></div>{basic.banner_image_url && <div className="mt-3 h-24 rounded-sm border border-line bg-slate-100 bg-cover bg-center" style={{ backgroundImage: `url("${basic.banner_image_url}")` }} />}</div>
        </div>
        <div className="grid gap-5 md:grid-cols-2"><div><label htmlFor="company-city" className="mb-1.5 block text-sm font-semibold text-ink">{copy.city}</label><input id="company-city" name="headquarters_city" maxLength={100} value={basic.headquarters_city ?? ""} onChange={(event) => setBasic({ ...basic, headquarters_city: event.target.value || null })} className={inputClass} /></div><div><label htmlFor="company-country" className="mb-1.5 block text-sm font-semibold text-ink">{copy.country}</label><input id="company-country" name="headquarters_country" maxLength={100} value={basic.headquarters_country ?? ""} onChange={(event) => setBasic({ ...basic, headquarters_country: event.target.value || null })} className={inputClass} /></div></div>
        <div className="flex justify-end pt-2"><button disabled={!demo && profilePending} className="h-11 rounded-sm bg-ink px-5 text-sm font-semibold text-white hover:bg-[#183b59] disabled:opacity-60">{demo ? copy.previewChanges : copy.saveProfile}</button></div>
      </form>
    </Tabs.Content>

    <Tabs.Content value="services" className="profile-tab-content py-6 outline-none">
      {demo && <p className="mb-5 border-l-2 border-ocean bg-[#f2f7f7] px-4 py-3 text-sm text-slate-600">{copy.changesNotSaved}</p>}
      <ActionFeedback state={demo ? { error: "", message: demoMessage } : servicesState} />
      <form action={demo ? undefined : servicesAction} onSubmit={demo ? (event) => saveDemo(event, setDemoMessage, copy.changesNotSaved) : undefined}>
        <input type="hidden" name="company_id" value={company.id} /><input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="services" value={JSON.stringify(services)} /><input type="hidden" name="areas" value={JSON.stringify(areas)} />
        <div className="mb-7 flex items-center justify-between gap-3"><h2 className="font-display text-lg font-semibold text-ink">{copy.servicesTab}</h2><button type="button" onClick={() => setServices([...services, { id: crypto.randomUUID(), company_id: company.id, category_id: "", description: "", scope_of_work: [] }])} className="inline-flex h-9 items-center gap-2 rounded-sm border border-line px-3 text-xs font-semibold text-ink hover:border-ocean hover:text-ocean"><Plus size={14} /> {copy.addService}</button></div>
        {services.length ? <div className="divide-y divide-line border-y border-line">{services.map((service, index) => <article key={service.id} className="py-5">
          <div className="mb-4 flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.servicesLabel} {index + 1}</span><button type="button" onClick={() => setServices(services.filter((_, itemIndex) => itemIndex !== index))} aria-label={`${copy.removeItem} ${copy.servicesLabel.toLowerCase()}`} className="grid size-8 place-items-center rounded-sm text-slate-400 hover:bg-red-50 hover:text-red-700"><Trash2 size={15} /></button></div>
          <div className="grid gap-4 md:grid-cols-2"><div><label htmlFor={`service-category-${index}`} className="mb-1.5 block text-sm font-medium text-slate-700">{copy.category}</label><select id={`service-category-${index}`} value={service.category_id} onChange={(event) => updateService(index, { category_id: event.target.value })} className={inputClass}><option value="">{copy.selectCategory}</option>{categories.map((category) => <option key={category.id} value={category.id} disabled={services.some((other, otherIndex) => otherIndex !== index && other.category_id === category.id)}>{category.name}</option>)}</select></div><div><label htmlFor={`service-description-${index}`} className="mb-1.5 block text-sm font-medium text-slate-700">{copy.serviceDescription}</label><textarea id={`service-description-${index}`} rows={3} maxLength={2000} value={service.description} onChange={(event) => updateService(index, { description: event.target.value })} className={areaClass} /></div></div>
          <div className="mt-4"><label htmlFor={`service-scope-${index}`} className="mb-1.5 block text-sm font-medium text-slate-700">{copy.workScope}</label><textarea id={`service-scope-${index}`} rows={3} value={service.scope_of_work.join("\n")} onChange={(event) => updateService(index, { scope_of_work: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) })} className={areaClass} /></div>
        </article>)}</div> : <p className="border-y border-line py-8 text-sm text-slate-500">{copy.noServicesInEditor}</p>}

        <div className="mb-4 mt-10 flex items-center justify-between gap-3"><h2 className="font-display text-lg font-semibold text-ink">{copy.coverageTab}</h2><button type="button" onClick={() => setAreas([...areas, { id: crypto.randomUUID(), company_id: company.id, origin_region: "", origin_country: "", destination_region: "", destination_country: "", is_domestic: false, is_international: true }])} className="inline-flex h-9 items-center gap-2 rounded-sm border border-line px-3 text-xs font-semibold text-ink hover:border-ocean hover:text-ocean"><Plus size={14} /> {copy.addArea}</button></div>
        {areas.length ? <div className="divide-y divide-line border-y border-line">{areas.map((area, index) => <article key={area.id} className="grid gap-4 py-5 md:grid-cols-2">
          <div className="flex items-center justify-between md:col-span-2"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.routes} {index + 1}</span><button type="button" onClick={() => setAreas(areas.filter((_, itemIndex) => itemIndex !== index))} aria-label={`${copy.removeItem} ${copy.routes}`} className="grid size-8 place-items-center rounded-sm text-slate-400 hover:bg-red-50 hover:text-red-700"><Trash2 size={15} /></button></div>
          <div><label htmlFor={`origin-region-${index}`} className="mb-1.5 block text-sm font-medium text-slate-700">{copy.originRegion}</label><input id={`origin-region-${index}`} value={area.origin_region ?? ""} onChange={(event) => updateArea(index, { origin_region: event.target.value || null })} className={inputClass} /></div>
          <div><label htmlFor={`origin-country-${index}`} className="mb-1.5 block text-sm font-medium text-slate-700">{copy.originCountry}</label><input id={`origin-country-${index}`} required value={area.origin_country} onChange={(event) => updateArea(index, { origin_country: event.target.value })} className={inputClass} /></div>
          <div><label htmlFor={`destination-region-${index}`} className="mb-1.5 block text-sm font-medium text-slate-700">{copy.destinationRegion}</label><input id={`destination-region-${index}`} value={area.destination_region ?? ""} onChange={(event) => updateArea(index, { destination_region: event.target.value || null })} className={inputClass} /></div>
          <div><label htmlFor={`destination-country-${index}`} className="mb-1.5 block text-sm font-medium text-slate-700">{copy.destinationCountry}</label><input id={`destination-country-${index}`} required value={area.destination_country} onChange={(event) => updateArea(index, { destination_country: event.target.value })} className={inputClass} /></div>
          <div><label htmlFor={`lane-mode-${index}`} className="mb-1.5 block text-sm font-medium text-slate-700">{copy.laneMode}</label><select id={`lane-mode-${index}`} value={area.is_domestic ? "domestic" : "international"} onChange={(event) => updateArea(index, { is_domestic: event.target.value === "domestic", is_international: event.target.value !== "domestic" })} className={inputClass}><option value="international">{copy.international}</option><option value="domestic">{copy.domestic}</option></select></div>
        </article>)}</div> : <p className="border-y border-line py-8 text-sm text-slate-500">{copy.noAreasInEditor}</p>}
        <div className="mt-6 flex justify-end"><button disabled={!demo && servicesPending} className="h-11 rounded-sm bg-ink px-5 text-sm font-semibold text-white hover:bg-[#183b59] disabled:opacity-60">{demo ? copy.previewChanges : copy.saveServices}</button></div>
      </form>
    </Tabs.Content>

    <Tabs.Content value="contacts" className="profile-tab-content py-6 outline-none">
      {demo && <p className="mb-5 border-l-2 border-ocean bg-[#f2f7f7] px-4 py-3 text-sm text-slate-600">{copy.changesNotSaved}</p>}
      <ActionFeedback state={demo ? { error: "", message: demoMessage } : contactsState} />
      <form action={demo ? undefined : contactsAction} onSubmit={demo ? (event) => saveDemo(event, setDemoMessage, copy.changesNotSaved) : undefined}>
        <input type="hidden" name="company_id" value={company.id} /><input type="hidden" name="locale" value={locale} /><input type="hidden" name="contacts" value={JSON.stringify(contacts)} />
        <div className="mb-7 flex items-center justify-between gap-3"><h2 className="font-display text-lg font-semibold text-ink">{copy.contactsTab}</h2><button type="button" onClick={() => setContacts([...contacts, { id: crypto.randomUUID(), company_id: company.id, pic_name: "", pic_role: "", email: "", phone: "", whatsapp: "", avatar_url: null, is_primary: contacts.length === 0 }])} className="inline-flex h-9 items-center gap-2 rounded-sm border border-line px-3 text-xs font-semibold text-ink hover:border-ocean hover:text-ocean"><Plus size={14} /> {copy.addContact}</button></div>
        {contacts.length ? <div className="divide-y divide-line border-y border-line">{contacts.map((contact, index) => <article key={contact.id} className="grid gap-4 py-5 sm:grid-cols-2">
          <div className="flex items-center justify-between sm:col-span-2"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.contactsTab} {index + 1}</span><button type="button" onClick={() => setContacts(contacts.filter((_, itemIndex) => itemIndex !== index))} aria-label={`${copy.removeItem} ${copy.contactsTab}`} className="grid size-8 place-items-center rounded-sm text-slate-400 hover:bg-red-50 hover:text-red-700"><Trash2 size={15} /></button></div>
          <div><label htmlFor={`pic-name-${index}`} className="mb-1.5 block text-sm font-medium text-slate-700">{copy.picName}</label><input id={`pic-name-${index}`} required value={contact.pic_name} onChange={(event) => updateContact(index, { pic_name: event.target.value })} className={inputClass} /></div>
          <div><label htmlFor={`pic-role-${index}`} className="mb-1.5 block text-sm font-medium text-slate-700">{copy.picRole}</label><input id={`pic-role-${index}`} value={contact.pic_role ?? ""} onChange={(event) => updateContact(index, { pic_role: event.target.value || null })} className={inputClass} /></div>
          <div><label htmlFor={`pic-email-${index}`} className="mb-1.5 block text-sm font-medium text-slate-700">{copy.picEmail}</label><input id={`pic-email-${index}`} required type="email" value={contact.email} onChange={(event) => updateContact(index, { email: event.target.value })} className={inputClass} /></div>
          <div><label htmlFor={`pic-phone-${index}`} className="mb-1.5 block text-sm font-medium text-slate-700">{copy.picPhone}</label><input id={`pic-phone-${index}`} type="tel" value={contact.phone ?? ""} onChange={(event) => updateContact(index, { phone: event.target.value || null })} className={inputClass} /></div>
          <div><label htmlFor={`pic-whatsapp-${index}`} className="mb-1.5 block text-sm font-medium text-slate-700">{copy.picWhatsapp}</label><input id={`pic-whatsapp-${index}`} type="tel" value={contact.whatsapp ?? ""} onChange={(event) => updateContact(index, { whatsapp: event.target.value || null })} className={inputClass} /></div>
          <div><label htmlFor={`pic-avatar-${index}`} className="mb-1.5 block text-sm font-medium text-slate-700">{copy.contactAvatar}</label><input id={`pic-avatar-${index}`} type="url" value={contact.avatar_url ?? ""} onChange={(event) => updateContact(index, { avatar_url: event.target.value || null })} className={inputClass} /><div className="mt-2"><AssetUploader companyId={company.id} folder="logos" accept="image/png,image/jpeg,image/webp,image/avif" demo={demo} locale={locale} onUploaded={(url) => updateContact(index, { avatar_url: url })} /></div></div>
          <label className="inline-flex items-center gap-2 self-end pb-3 text-sm text-slate-700"><input type="checkbox" checked={contact.is_primary} onChange={(event) => updateContact(index, { is_primary: event.target.checked })} className="rounded-sm border-line text-ocean focus:ring-ocean" />{copy.primaryPIC}</label>
        </article>)}</div> : <p className="border-y border-line py-8 text-sm text-slate-500">{copy.noContactsInEditor}</p>}
        <div className="mt-6 flex justify-end"><button disabled={!demo && contactsPending} className="h-11 rounded-sm bg-ink px-5 text-sm font-semibold text-white hover:bg-[#183b59] disabled:opacity-60">{demo ? copy.previewChanges : copy.saveContacts}</button></div>
      </form>
    </Tabs.Content>

    <Tabs.Content value="gallery" className="profile-tab-content py-6 outline-none">
      {demo && <p className="mb-5 border-l-2 border-ocean bg-[#f2f7f7] px-4 py-3 text-sm text-slate-600">{copy.changesNotSaved}</p>}
      <ActionFeedback state={demo ? { error: "", message: demoMessage } : galleryState} />
      <form action={demo ? undefined : galleryAction} onSubmit={demo ? (event) => saveDemo(event, setDemoMessage, copy.changesNotSaved) : undefined}>
        <input type="hidden" name="company_id" value={company.id} /><input type="hidden" name="locale" value={locale} /><input type="hidden" name="gallery" value={JSON.stringify(gallery)} />
        <div className="mb-7 flex items-center justify-between gap-3"><h2 className="font-display text-lg font-semibold text-ink">{copy.galleryTab}</h2><button type="button" onClick={() => setGallery([...gallery, { id: crypto.randomUUID(), company_id: company.id, image_url: "", caption: "", sort_order: gallery.length }])} className="inline-flex h-9 items-center gap-2 rounded-sm border border-line px-3 text-xs font-semibold text-ink hover:border-ocean hover:text-ocean"><Plus size={14} /> {copy.addGalleryImage}</button></div>
        {gallery.length ? <div className="divide-y divide-line border-y border-line">{gallery.map((image, index) => <article key={image.id} className="grid gap-4 py-5 sm:grid-cols-[1fr_220px]">
          <div className="flex items-center justify-between sm:col-span-2"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.galleryPhoto} {index + 1}</span><button type="button" onClick={() => setGallery(gallery.filter((_, itemIndex) => itemIndex !== index))} aria-label={`${copy.removeItem} ${copy.galleryPhoto}`} className="grid size-8 place-items-center rounded-sm text-slate-400 hover:bg-red-50 hover:text-red-700"><Trash2 size={15} /></button></div>
          <div><label htmlFor={`gallery-url-${index}`} className="mb-1.5 block text-sm font-medium text-slate-700">{copy.galleryPhoto} URL</label><input id={`gallery-url-${index}`} type="url" value={image.image_url} onChange={(event) => updateGallery(index, { image_url: event.target.value })} className={inputClass} /><div className="mt-2"><AssetUploader companyId={company.id} folder="gallery" accept="image/png,image/jpeg,image/webp,image/avif" demo={demo} locale={locale} onUploaded={(url) => updateGallery(index, { image_url: url })} /></div><label htmlFor={`gallery-caption-${index}`} className="mb-1.5 mt-4 block text-sm font-medium text-slate-700">{copy.imageCaption}</label><input id={`gallery-caption-${index}`} maxLength={240} value={image.caption ?? ""} onChange={(event) => updateGallery(index, { caption: event.target.value || null })} className={inputClass} /></div>
          <div className="min-h-32 rounded-sm border border-line bg-slate-100 bg-cover bg-center" role="img" aria-label={image.caption || `${copy.galleryPhoto} ${index + 1}`} style={image.image_url ? { backgroundImage: `url("${image.image_url}")` } : undefined} />
        </article>)}</div> : <p className="border-y border-line py-8 text-sm text-slate-500">{copy.noGalleryInEditor}</p>}
        <div className="mt-6 flex justify-end"><button disabled={!demo && galleryPending} className="h-11 rounded-sm bg-ink px-5 text-sm font-semibold text-white hover:bg-[#183b59] disabled:opacity-60">{demo ? copy.previewChanges : copy.saveGallery}</button></div>
      </form>
    </Tabs.Content>
  </Tabs.Root>;
}
