import type { Forwarder } from "@/types/database";

export function getServiceNames(forwarder: Forwarder): string[] {
  return forwarder.company_services.flatMap((service) => service.service_categories?.name ?? []);
}

export function getCoverageLabels(forwarder: Forwarder): string[] {
  return Array.from(new Set(forwarder.service_areas.map((area) => area.destination_country)));
}

export function getSafeHttpUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const normalized = value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
    const parsed = new URL(normalized);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}
