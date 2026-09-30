export type VerificationStatus = "pending" | "verified" | "rejected";
export type CompanyStatus = "draft" | "published" | "archived";
export type CompanyMemberRole = "owner" | "admin" | "editor";

export type CompanyRecord = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  banner_image_url: string | null;
  description: string;
  company_profile_pdf_url: string | null;
  website: string | null;
  verified_status: VerificationStatus;
  status: CompanyStatus;
  headquarters_city: string | null;
  headquarters_country: string | null;
  created_at: string;
};

export type ServiceCategoryRecord = {
  id: string;
  name: string;
  slug: string;
  icon_name: string | null;
};

export type CompanyServiceRecord = {
  id: string;
  company_id: string;
  category_id: string;
  description: string;
  scope_of_work: string[];
  service_categories?: ServiceCategoryRecord | null;
};

export type CompanyGalleryRecord = {
  id: string;
  company_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
};

export type CompanyContactRecord = {
  id: string;
  company_id: string;
  pic_name: string;
  pic_role: string | null;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  avatar_url: string | null;
  is_primary: boolean;
};

export type ServiceAreaRecord = {
  id: string;
  company_id: string;
  origin_region: string | null;
  origin_country: string;
  destination_region: string | null;
  destination_country: string;
  is_domestic: boolean;
  is_international: boolean;
};

export type CompanyMemberRecord = {
  company_id: string;
  user_id: string;
  role: CompanyMemberRole;
  created_at: string;
};

export type PlatformAdminRecord = {
  user_id: string;
  created_at: string;
};

export type Forwarder = CompanyRecord & {
  company_services: CompanyServiceRecord[];
  company_gallery: CompanyGalleryRecord[];
  company_contacts: CompanyContactRecord[];
  service_areas: ServiceAreaRecord[];
};

type TableDefinition<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      companies: TableDefinition<
        CompanyRecord,
        Omit<CompanyRecord, "id" | "created_at" | "updated_at">,
        Partial<CompanyRecord>
      >;
      company_members: TableDefinition<CompanyMemberRecord, Omit<CompanyMemberRecord, "created_at">>;
      platform_admins: TableDefinition<PlatformAdminRecord, Omit<PlatformAdminRecord, "created_at">>;
      service_categories: TableDefinition<ServiceCategoryRecord, Omit<ServiceCategoryRecord, "id">>;
      company_services: TableDefinition<CompanyServiceRecord, Omit<CompanyServiceRecord, "id">>;
      company_gallery: TableDefinition<CompanyGalleryRecord, Omit<CompanyGalleryRecord, "id">>;
      company_contacts: TableDefinition<CompanyContactRecord, Omit<CompanyContactRecord, "id">>;
      service_areas: TableDefinition<ServiceAreaRecord, Omit<ServiceAreaRecord, "id">>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      company_status: CompanyStatus;
      verification_status: VerificationStatus;
      company_member_role: CompanyMemberRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
