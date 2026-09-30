"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireForwarderCompany } from "@/lib/auth";
import { getSafeHttpUrl } from "@/lib/forwarder-utils";
import { messages, type Locale } from "@/lib/messages";
import { areWorkspacesEnabled, isDemoForwarderPreview } from "@/lib/workspaces";
import type { CompanyRecord } from "@/types/database";

export type EditorActionState = { error: string; message: string };

function getLocale(formData: FormData): Locale {
  return formData.get("locale") === "en" ? "en" : "id";
}

function companyIdFrom(formData: FormData) {
  return String(formData.get("company_id") ?? "");
}

function parseRows(formData: FormData, key: string): Record<string, unknown>[] | null {
  try {
    const value: unknown = JSON.parse(String(formData.get(key) ?? "[]"));
    return Array.isArray(value) && value.every((row) => row && typeof row === "object" && !Array.isArray(row))
      ? value as Record<string, unknown>[]
      : null;
  } catch {
    return null;
  }
}

function isUuid(value: string) {
  return /^[0-9a-f-]{36}$/i.test(value);
}

async function getEditableSession(companyId: string, formData: FormData) {
  if (!isUuid(companyId) || isDemoForwarderPreview() || !areWorkspacesEnabled()) return null;
  return requireForwarderCompany(companyId);
}

function finish(companyId: string, slug: string) {
  revalidatePath("/forwarder");
  revalidatePath(`/forwarder/companies/${companyId}`);
  revalidatePath(`/forwarders/${slug}`);
}

export async function updateForwarderProfile(formData: FormData) {
  const companyId = companyIdFrom(formData);
  const result = await saveCompanyDetails({ error: "", message: "" }, formData);
  if (result.error) redirect(`/forwarder/companies/${companyId}?error=save`);
  redirect(`/forwarder/companies/${companyId}?saved=1`);
}

export async function saveCompanyDetails(_state: EditorActionState, formData: FormData): Promise<EditorActionState> {
  const copy = messages[getLocale(formData)];
  const companyId = companyIdFrom(formData);
  if (isDemoForwarderPreview()) return { error: "", message: copy.changesNotSaved };
  const session = await getEditableSession(companyId, formData);
  if (!session) return { error: copy.saveError, message: "" };

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const urlFields = ["website", "logo_url", "banner_image_url", "company_profile_pdf_url"] as const;
  const urls = Object.fromEntries(urlFields.map((field) => {
    const value = String(formData.get(field) ?? "").trim();
    return [field, value ? getSafeHttpUrl(value) : null];
  })) as Record<(typeof urlFields)[number], string | null>;
  const hasInvalidUrl = urlFields.some((field) => String(formData.get(field) ?? "").trim() && !urls[field]);
  if (name.length < 2 || name.length > 160 || description.length > 5000 || hasInvalidUrl) {
    return { error: copy.invalidProfile, message: "" };
  }

  const changes = {
    name,
    description,
    website: urls.website,
    logo_url: urls.logo_url,
    banner_image_url: urls.banner_image_url,
    company_profile_pdf_url: urls.company_profile_pdf_url,
    headquarters_city: String(formData.get("headquarters_city") ?? "").trim() || null,
    headquarters_country: String(formData.get("headquarters_country") ?? "").trim() || null,
  } satisfies Partial<CompanyRecord>;
  const { error } = await session.supabase.from("companies").update(changes as never).eq("id", companyId);
  if (error) return { error: copy.saveError, message: "" };
  finish(companyId, session.company.slug);
  return { error: "", message: copy.profileSaved };
}

export async function saveServicesAndAreas(_state: EditorActionState, formData: FormData): Promise<EditorActionState> {
  const copy = messages[getLocale(formData)];
  const companyId = companyIdFrom(formData);
  if (isDemoForwarderPreview()) return { error: "", message: copy.changesNotSaved };
  const session = await getEditableSession(companyId, formData);
  if (!session) return { error: copy.saveError, message: "" };

  const services = parseRows(formData, "services");
  const areas = parseRows(formData, "areas");
  if (!services || !areas || services.length > 30 || areas.length > 100) return { error: copy.saveError, message: "" };
  if (services.some((row) => !String(row.category_id ?? "").trim())) return { error: copy.invalidServices, message: "" };
  if (areas.some((row) => !String(row.origin_country ?? "").trim() || !String(row.destination_country ?? "").trim())) return { error: copy.invalidCoverage, message: "" };

  const cleanServices = services.map((row) => ({
    id: isUuid(String(row.id ?? "")) ? String(row.id) : randomUUID(),
    company_id: companyId,
    category_id: String(row.category_id ?? ""),
    description: String(row.description ?? "").trim().slice(0, 2000),
    scope_of_work: Array.isArray(row.scope_of_work) ? row.scope_of_work.map(String).map((scope) => scope.trim()).filter(Boolean).slice(0, 30) : [],
  }));
  if (cleanServices.some((service) => !isUuid(service.category_id)) || new Set(cleanServices.map((service) => service.category_id)).size !== cleanServices.length) {
    return { error: copy.invalidServices, message: "" };
  }
  const cleanAreas = areas.map((row) => ({
    id: isUuid(String(row.id ?? "")) ? String(row.id) : randomUUID(),
    company_id: companyId,
    origin_region: String(row.origin_region ?? "").trim() || null,
    origin_country: String(row.origin_country ?? "").trim().slice(0, 100),
    destination_region: String(row.destination_region ?? "").trim() || null,
    destination_country: String(row.destination_country ?? "").trim().slice(0, 100),
    is_domestic: row.is_domestic === true,
    is_international: row.is_domestic !== true,
  }));

  const { data: serviceRows, error: serviceReadError } = await session.supabase.from("company_services").select("id").eq("company_id", companyId);
  if (serviceReadError) return { error: copy.saveError, message: "" };
  const serviceIds = ((serviceRows ?? []) as unknown as { id: string }[]).map((row) => row.id);
  if (cleanServices.length) {
    const { error } = await session.supabase.from("company_services").upsert(cleanServices as never);
    if (error) return { error: copy.invalidServices, message: "" };
  }
  const retainedServiceIds = new Set(cleanServices.map((service) => service.id));
  const staleServiceIds = serviceIds.filter((id) => !retainedServiceIds.has(id));
  if (staleServiceIds.length) {
    const { error } = await session.supabase.from("company_services").delete().eq("company_id", companyId).in("id", staleServiceIds);
    if (error) return { error: copy.saveError, message: "" };
  }

  const { data: areaRows, error: areaReadError } = await session.supabase.from("service_areas").select("id").eq("company_id", companyId);
  if (areaReadError) return { error: copy.saveError, message: "" };
  const areaIds = ((areaRows ?? []) as unknown as { id: string }[]).map((row) => row.id);
  if (cleanAreas.length) {
    const { error } = await session.supabase.from("service_areas").upsert(cleanAreas as never);
    if (error) return { error: copy.saveError, message: "" };
  }
  const retainedAreaIds = new Set(cleanAreas.map((area) => area.id));
  const staleAreaIds = areaIds.filter((id) => !retainedAreaIds.has(id));
  if (staleAreaIds.length) {
    const { error } = await session.supabase.from("service_areas").delete().eq("company_id", companyId).in("id", staleAreaIds);
    if (error) return { error: copy.saveError, message: "" };
  }

  finish(companyId, session.company.slug);
  return { error: "", message: copy.servicesSaved };
}

export async function saveContacts(_state: EditorActionState, formData: FormData): Promise<EditorActionState> {
  const copy = messages[getLocale(formData)];
  const companyId = companyIdFrom(formData);
  if (isDemoForwarderPreview()) return { error: "", message: copy.changesNotSaved };
  const session = await getEditableSession(companyId, formData);
  if (!session) return { error: copy.saveError, message: "" };

  const contacts = parseRows(formData, "contacts");
  if (!contacts || contacts.length > 20) return { error: copy.saveError, message: "" };
  if (contacts.some((row) => !String(row.pic_name ?? "").trim() || !String(row.email ?? "").trim())) return { error: copy.invalidContacts, message: "" };
  if (contacts.filter((row) => row.is_primary === true).length > 1) return { error: copy.onePrimaryContact, message: "" };
  const cleanContacts = contacts.filter((row) => String(row.pic_name ?? "").trim() && String(row.email ?? "").trim()).map((row) => ({
    id: isUuid(String(row.id ?? "")) ? String(row.id) : randomUUID(),
    company_id: companyId,
    pic_name: String(row.pic_name ?? "").trim().slice(0, 120),
    pic_role: String(row.pic_role ?? "").trim().slice(0, 160) || null,
    email: String(row.email ?? "").trim().toLowerCase().slice(0, 254),
    phone: String(row.phone ?? "").trim().slice(0, 60) || null,
    whatsapp: String(row.whatsapp ?? "").trim().slice(0, 60) || null,
    avatar_url: getSafeHttpUrl(String(row.avatar_url ?? "").trim()) || null,
    is_primary: row.is_primary === true,
  }));
  if (cleanContacts.length !== contacts.length || cleanContacts.some((contact) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email))) {
    return { error: copy.invalidContacts, message: "" };
  }

  const { data: contactRows, error: contactReadError } = await session.supabase.from("company_contacts").select("id").eq("company_id", companyId);
  if (contactReadError) return { error: copy.saveError, message: "" };
  const contactIds = ((contactRows ?? []) as unknown as { id: string }[]).map((row) => row.id);
  if (cleanContacts.length) {
    const { error } = await session.supabase.from("company_contacts").update({ is_primary: false } as never).eq("company_id", companyId);
    if (error) return { error: copy.saveError, message: "" };
    const { error: upsertError } = await session.supabase.from("company_contacts").upsert(cleanContacts as never);
    if (upsertError) return { error: copy.invalidContacts, message: "" };
  }
  const retainedContactIds = new Set(cleanContacts.map((contact) => contact.id));
  const staleContactIds = contactIds.filter((id) => !retainedContactIds.has(id));
  if (staleContactIds.length) {
    const { error } = await session.supabase.from("company_contacts").delete().eq("company_id", companyId).in("id", staleContactIds);
    if (error) return { error: copy.saveError, message: "" };
  }

  finish(companyId, session.company.slug);
  return { error: "", message: copy.contactsSaved };
}

export async function saveGallery(_state: EditorActionState, formData: FormData): Promise<EditorActionState> {
  const copy = messages[getLocale(formData)];
  const companyId = companyIdFrom(formData);
  if (isDemoForwarderPreview()) return { error: "", message: copy.changesNotSaved };
  const session = await getEditableSession(companyId, formData);
  if (!session) return { error: copy.saveError, message: "" };

  const gallery = parseRows(formData, "gallery");
  if (!gallery || gallery.length > 60) return { error: copy.saveError, message: "" };
  if (gallery.some((row) => !String(row.image_url ?? "").trim())) return { error: copy.invalidGallery, message: "" };
  const cleanGallery = gallery.map((row, index) => ({
    id: isUuid(String(row.id ?? "")) ? String(row.id) : randomUUID(),
    company_id: companyId,
    image_url: getSafeHttpUrl(String(row.image_url ?? "").trim()),
    caption: String(row.caption ?? "").trim().slice(0, 240) || null,
    sort_order: index,
  }));
  if (cleanGallery.some((image) => !image.image_url)) return { error: copy.invalidGallery, message: "" };

  const { data: galleryRows, error: galleryReadError } = await session.supabase.from("company_gallery").select("id").eq("company_id", companyId);
  if (galleryReadError) return { error: copy.saveError, message: "" };
  const galleryIds = ((galleryRows ?? []) as unknown as { id: string }[]).map((row) => row.id);
  if (cleanGallery.length) {
    const { error } = await session.supabase.from("company_gallery").upsert(cleanGallery as never);
    if (error) return { error: copy.invalidGallery, message: "" };
  }
  const retainedGalleryIds = new Set(cleanGallery.map((image) => image.id));
  const staleGalleryIds = galleryIds.filter((id) => !retainedGalleryIds.has(id));
  if (staleGalleryIds.length) {
    const { error } = await session.supabase.from("company_gallery").delete().eq("company_id", companyId).in("id", staleGalleryIds);
    if (error) return { error: copy.saveError, message: "" };
  }

  finish(companyId, session.company.slug);
  return { error: "", message: copy.gallerySaved };
}
