import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CompanyContactRecord,
  CompanyGalleryRecord,
  CompanyRecord,
  CompanyServiceRecord,
  Forwarder,
  ServiceAreaRecord,
  ServiceCategoryRecord,
} from "@/types/database";

const photo = (id: string, width = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

export const demoForwarders: Forwarder[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    name: "Meridian Global Logistics",
    slug: "meridian-global-logistics",
    logo_url: null,
    banner_image_url: photo("photo-1494412519320-aa613dfb7738"),
    description: "A privately owned forwarding partner connecting Asia's manufacturing hubs with the world's most important trade lanes. Our local teams coordinate every handoff, from factory gate to final mile.",
    company_profile_pdf_url: null,
    website: "https://example.com",
    verified_status: "verified",
    status: "published",
    headquarters_city: "Singapore",
    headquarters_country: "Singapore",
    created_at: "2024-08-21T00:00:00.000Z",
    company_services: [
      { id: "s-1", company_id: "10000000-0000-4000-8000-000000000001", category_id: "cat-sea", description: "Reliable ocean freight with flexible capacity and proactive milestone visibility.", scope_of_work: ["FCL and LCL", "Carrier procurement", "Origin consolidation"], service_categories: { id: "cat-sea", name: "Sea freight", slug: "sea-freight", icon_name: "Ship" } },
      { id: "s-2", company_id: "10000000-0000-4000-8000-000000000001", category_id: "cat-customs", description: "Practical customs support for complex cross-border shipments.", scope_of_work: ["Import and export clearance", "Trade documentation", "Duty consulting"], service_categories: { id: "cat-customs", name: "Customs clearance", slug: "customs-clearance", icon_name: "ClipboardCheck" } },
      { id: "s-3", company_id: "10000000-0000-4000-8000-000000000001", category_id: "cat-air", description: "Time-definite air cargo options for critical and high-value goods.", scope_of_work: ["Priority air freight", "Consolidation", "Dangerous goods"], service_categories: { id: "cat-air", name: "Air freight", slug: "air-freight", icon_name: "Plane" } },
    ],
    company_gallery: [
      { id: "g-1", company_id: "10000000-0000-4000-8000-000000000001", image_url: photo("photo-1566576912321-d58ddd7a6088", 1000), caption: "Distribution center operations", sort_order: 0 },
      { id: "g-2", company_id: "10000000-0000-4000-8000-000000000001", image_url: photo("photo-1586528116311-ad8dd3c8310d", 1000), caption: "Warehouse and fulfillment", sort_order: 1 },
      { id: "g-3", company_id: "10000000-0000-4000-8000-000000000001", image_url: photo("photo-1504307651254-35680f356dfd", 1000), caption: "Ocean freight operations", sort_order: 2 },
    ],
    company_contacts: [{ id: "p-1", company_id: "10000000-0000-4000-8000-000000000001", pic_name: "Maya Chen", pic_role: "Regional Business Development", email: "maya@example.com", phone: "+65 6123 4567", whatsapp: "+6561234567", avatar_url: null, is_primary: true }],
    service_areas: [
      { id: "a-1", company_id: "10000000-0000-4000-8000-000000000001", origin_region: "Southeast Asia", origin_country: "Singapore", destination_region: "North America", destination_country: "United States", is_domestic: false, is_international: true },
      { id: "a-2", company_id: "10000000-0000-4000-8000-000000000001", origin_region: "East Asia", origin_country: "China", destination_region: "Europe", destination_country: "Netherlands", is_domestic: false, is_international: true },
      { id: "a-3", company_id: "10000000-0000-4000-8000-000000000001", origin_region: "Southeast Asia", origin_country: "Singapore", destination_region: "Southeast Asia", destination_country: "Malaysia", is_domestic: false, is_international: true },
    ],
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    name: "Northstar Freight Partners",
    slug: "northstar-freight-partners",
    logo_url: null,
    banner_image_url: photo("photo-1553413077-190dd305871c"),
    description: "Independent freight specialists with a strong North American network and deep experience in temperature-sensitive and time-critical cargo.",
    company_profile_pdf_url: null,
    website: "https://example.com",
    verified_status: "verified",
    status: "published",
    headquarters_city: "Chicago",
    headquarters_country: "United States",
    created_at: "2024-06-18T00:00:00.000Z",
    company_services: [
      { id: "s-4", company_id: "10000000-0000-4000-8000-000000000002", category_id: "cat-air", description: "Global air cargo management for urgent, valuable and temperature-controlled freight.", scope_of_work: ["Air charter coordination", "Cold chain handling", "Priority uplift"], service_categories: { id: "cat-air", name: "Air freight", slug: "air-freight", icon_name: "Plane" } },
      { id: "s-5", company_id: "10000000-0000-4000-8000-000000000002", category_id: "cat-road", description: "Cross-border trucking and domestic distribution across North America.", scope_of_work: ["FTL and LTL", "Expedited trucking", "Final-mile delivery"], service_categories: { id: "cat-road", name: "Inland transport", slug: "inland-transport", icon_name: "Truck" } },
    ],
    company_gallery: [
      { id: "g-4", company_id: "10000000-0000-4000-8000-000000000002", image_url: photo("photo-1580674285054-bed31e145f59", 1000), caption: "Cross-dock facility", sort_order: 0 },
      { id: "g-5", company_id: "10000000-0000-4000-8000-000000000002", image_url: photo("photo-1565891741441-64926e441838", 1000), caption: "Fleet operations", sort_order: 1 },
    ],
    company_contacts: [{ id: "p-2", company_id: "10000000-0000-4000-8000-000000000002", pic_name: "Jordan Lee", pic_role: "Director, Client Solutions", email: "jordan@example.com", phone: "+1 312 555 0184", whatsapp: "+13125550184", avatar_url: null, is_primary: true }],
    service_areas: [{ id: "a-4", company_id: "10000000-0000-4000-8000-000000000002", origin_region: "North America", origin_country: "United States", destination_region: "Europe", destination_country: "Germany", is_domestic: false, is_international: true }],
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    name: "BlueHarbor Shipping & Logistics",
    slug: "blueharbor-shipping-logistics",
    logo_url: null,
    banner_image_url: photo("photo-1516900557549-41557d405adf"),
    description: "Port-led logistics and ocean freight coordination for importers and exporters moving goods through major European gateways.",
    company_profile_pdf_url: null,
    website: "https://example.com",
    verified_status: "verified",
    status: "published",
    headquarters_city: "Rotterdam",
    headquarters_country: "Netherlands",
    created_at: "2024-05-02T00:00:00.000Z",
    company_services: [
      { id: "s-6", company_id: "10000000-0000-4000-8000-000000000003", category_id: "cat-sea", description: "Ocean forwarding and port services focused on European trade lanes.", scope_of_work: ["FCL and LCL", "Breakbulk cargo", "Port coordination"], service_categories: { id: "cat-sea", name: "Sea freight", slug: "sea-freight", icon_name: "Ship" } },
      { id: "s-7", company_id: "10000000-0000-4000-8000-000000000003", category_id: "cat-warehouse", description: "Flexible storage and cargo handling near key seaports.", scope_of_work: ["Bonded warehousing", "Cross-docking", "Cargo inspection"], service_categories: { id: "cat-warehouse", name: "Warehousing", slug: "warehousing", icon_name: "Warehouse" } },
    ],
    company_gallery: [{ id: "g-6", company_id: "10000000-0000-4000-8000-000000000003", image_url: photo("photo-1494412574643-35d324698fbd", 1000), caption: "Port-side freight handling", sort_order: 0 }],
    company_contacts: [{ id: "p-3", company_id: "10000000-0000-4000-8000-000000000003", pic_name: "Sophie van Dijk", pic_role: "Commercial Manager", email: "sophie@example.com", phone: "+31 10 555 0190", whatsapp: "+31105550190", avatar_url: null, is_primary: true }],
    service_areas: [{ id: "a-5", company_id: "10000000-0000-4000-8000-000000000003", origin_region: "Europe", origin_country: "Netherlands", destination_region: "East Asia", destination_country: "Japan", is_domestic: false, is_international: true }],
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    name: "Atlas Customs & Trade",
    slug: "atlas-customs-trade",
    logo_url: null,
    banner_image_url: photo("photo-1601584115197-04ecc0da31d7"),
    description: "Customs brokerage and trade compliance specialists helping businesses move confidently through changing regulatory requirements.",
    company_profile_pdf_url: null,
    website: "https://example.com",
    verified_status: "pending",
    status: "published",
    headquarters_city: "London",
    headquarters_country: "United Kingdom",
    created_at: "2024-07-09T00:00:00.000Z",
    company_services: [
      { id: "s-8", company_id: "10000000-0000-4000-8000-000000000004", category_id: "cat-customs", description: "End-to-end customs support for international trade compliance.", scope_of_work: ["Import declarations", "Export declarations", "Tariff classification"], service_categories: { id: "cat-customs", name: "Customs clearance", slug: "customs-clearance", icon_name: "ClipboardCheck" } },
    ],
    company_gallery: [{ id: "g-7", company_id: "10000000-0000-4000-8000-000000000004", image_url: photo("photo-1563013544-824ae1b704d3", 1000), caption: "Trade compliance team", sort_order: 0 }],
    company_contacts: [{ id: "p-4", company_id: "10000000-0000-4000-8000-000000000004", pic_name: "Oliver Grant", pic_role: "Head of Client Services", email: "oliver@example.com", phone: "+44 20 7946 0188", whatsapp: "+442079460188", avatar_url: null, is_primary: true }],
    service_areas: [{ id: "a-6", company_id: "10000000-0000-4000-8000-000000000004", origin_region: "Europe", origin_country: "United Kingdom", destination_region: "Europe", destination_country: "France", is_domestic: false, is_international: true }],
  },
  {
    id: "90000000-0000-4000-8000-000000000001",
    name: "Harborlight Freight Co.",
    slug: "harborlight-freight-demo",
    logo_url: null,
    banner_image_url: photo("photo-1494412519320-aa613dfb7738"),
    description: "A demo forwarding partner coordinating ocean freight, customs support and port-to-door logistics across Southeast Asia and Europe. This sample profile is provided for testing the directory and profile experience.",
    company_profile_pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    website: "https://example.com",
    verified_status: "pending",
    status: "published",
    headquarters_city: "Singapore",
    headquarters_country: "Singapore",
    created_at: "2026-09-30T00:00:00.000Z",
    company_services: [
      { id: "90000000-0000-4000-8000-000000000002", company_id: "90000000-0000-4000-8000-000000000001", category_id: "cat-sea", description: "Ocean forwarding for full-container and consolidated cargo, with customs coordination at origin and destination.", scope_of_work: ["FCL and LCL", "Export documentation", "Customs coordination"], service_categories: { id: "cat-sea", name: "Sea freight", slug: "sea-freight", icon_name: "Ship" } },
      { id: "90000000-0000-4000-8000-000000000003", company_id: "90000000-0000-4000-8000-000000000001", category_id: "cat-customs", description: "Cross-border customs clearance support and preparation of import and export documentation.", scope_of_work: ["Import declarations", "Export declarations", "Trade documentation"], service_categories: { id: "cat-customs", name: "Customs clearance", slug: "customs-clearance", icon_name: "ClipboardCheck" } },
    ],
    company_gallery: [
      { id: "90000000-0000-4000-8000-000000000004", company_id: "90000000-0000-4000-8000-000000000001", image_url: photo("photo-1566576912321-d58ddd7a6088", 1000), caption: "Warehouse handling operations", sort_order: 0 },
      { id: "90000000-0000-4000-8000-000000000005", company_id: "90000000-0000-4000-8000-000000000001", image_url: photo("photo-1586528116311-ad8dd3c8310d", 1000), caption: "Storage and fulfillment facility", sort_order: 1 },
    ],
    company_contacts: [{ id: "90000000-0000-4000-8000-000000000006", company_id: "90000000-0000-4000-8000-000000000001", pic_name: "Avery Tan", pic_role: "Regional Partnerships Manager", email: "avery@harborlight.example", phone: "+65 6000 1234", whatsapp: "+6560001234", avatar_url: null, is_primary: true }],
    service_areas: [{ id: "90000000-0000-4000-8000-000000000007", company_id: "90000000-0000-4000-8000-000000000001", origin_region: "Southeast Asia", origin_country: "Singapore", destination_region: "Western Europe", destination_country: "Netherlands", is_domestic: false, is_international: true }],
  },
];

export async function getForwarders(): Promise<Forwarder[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return demoForwarders;

  const { data: companyRows, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .eq("status", "published")
    .order("name");
  const companies = companyRows as unknown as CompanyRecord[] | null;

  if (companyError || !companies?.length) return [];

  const companyIds = companies.map((company) => company.id);
  const [serviceResult, galleryResult, contactResult, areaResult, categoryResult] = await Promise.all([
    supabase.from("company_services").select("*").in("company_id", companyIds),
    supabase.from("company_gallery").select("*").in("company_id", companyIds).order("sort_order"),
    supabase.from("company_contacts").select("*").in("company_id", companyIds).order("is_primary", { ascending: false }),
    supabase.from("service_areas").select("*").in("company_id", companyIds),
    supabase.from("service_categories").select("*"),
  ]);

  const categoryRows = categoryResult.data as unknown as ServiceCategoryRecord[] | null;
  const categories = new Map((categoryRows ?? []).map((category) => [category.id, category]));
  const groupByCompany = <T extends { company_id: string }>(records: T[] | null) => {
    const grouped = new Map<string, T[]>();
    for (const record of records ?? []) grouped.set(record.company_id, [...(grouped.get(record.company_id) ?? []), record]);
    return grouped;
  };
  const servicesByCompany = groupByCompany(serviceResult.data as CompanyServiceRecord[] | null);
  const galleriesByCompany = groupByCompany(galleryResult.data as CompanyGalleryRecord[] | null);
  const contactsByCompany = groupByCompany(contactResult.data as CompanyContactRecord[] | null);
  const areasByCompany = groupByCompany(areaResult.data as ServiceAreaRecord[] | null);

  return (companies as CompanyRecord[]).map((company) => ({
    ...company,
    company_services: (servicesByCompany.get(company.id) ?? []).map((service) => ({
      ...service,
      service_categories: categories.get(service.category_id) ?? null,
    })),
    company_gallery: galleriesByCompany.get(company.id) ?? [],
    company_contacts: contactsByCompany.get(company.id) ?? [],
    service_areas: areasByCompany.get(company.id) ?? [],
  }));
}

export async function getForwarderBySlug(slug: string): Promise<Forwarder | null> {
  const forwarders = await getForwarders();
  return forwarders.find((forwarder) => forwarder.slug === slug) ?? null;
}

export function getAllServiceCategories(forwarders: Forwarder[]): ServiceCategoryRecord[] {
  const categories = new Map<string, ServiceCategoryRecord>();
  for (const forwarder of forwarders) {
    for (const service of forwarder.company_services) {
      if (service.service_categories) categories.set(service.category_id, service.service_categories);
    }
  }
  return [...categories.values()].sort((left, right) => left.name.localeCompare(right.name));
}
