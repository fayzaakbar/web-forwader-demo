"use server";

import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSafeHttpUrl } from "@/lib/forwarder-utils";
import { messages, type Locale } from "@/lib/messages";
import { areWorkspacesEnabled, isDemoRolePreview } from "@/lib/workspaces";
import type { Database } from "@/types/database";

type RegistrationState = { error: string; message: string };

export async function registerForwarderAction(_previousState: RegistrationState, formData: FormData): Promise<RegistrationState> {
  const locale: Locale = formData.get("locale") === "en" ? "en" : "id";
  const copy = messages[locale];
  if (isDemoRolePreview()) return { error: "", message: copy.registrationSent };
  if (!areWorkspacesEnabled()) return { error: copy.accessDisabled, message: "" };

  const name = String(formData.get("contact_name") ?? "").trim();
  const companyName = String(formData.get("company_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const websiteInput = String(formData.get("website") ?? "").trim();
  const website = websiteInput ? getSafeHttpUrl(websiteInput) : null;

  if (name.length < 2 || name.length > 120 || companyName.length < 2 || companyName.length > 160 || !email || password.length < 8 || (websiteInput && !website)) {
    return { error: copy.registrationError, message: "" };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !anonKey || !serviceRoleKey) return { error: copy.registrationError, message: "" };

  const authClient = await createSupabaseServerClient();
  if (!authClient) return { error: copy.registrationError, message: "" };
  const { data: authResult, error: authError } = await authClient.auth.signUp({
    email,
    password,
    options: { data: { full_name: name, company_name: companyName } },
  });
  if (authError || !authResult.user) {
    return { error: authError?.message.includes("already registered") ? copy.accountExists : copy.registrationError, message: "" };
  }

  const admin = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const slugBase = companyName.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90) || "forwarder";
  const slug = `${slugBase}-${randomUUID().slice(0, 8)}`;
  const companyValues = {
    name: companyName,
    slug,
    logo_url: null,
    banner_image_url: null,
    description: "",
    company_profile_pdf_url: null,
    website,
    verified_status: "pending" as const,
    status: "draft" as const,
    headquarters_city: null,
    headquarters_country: null,
  };
  const { data: company, error: companyError } = await admin.from("companies").insert(companyValues as never).select("id").single();
  if (companyError || !company) {
    await admin.auth.admin.deleteUser(authResult.user.id);
    return { error: copy.registrationError, message: "" };
  }

  const { error: memberError } = await admin.from("company_members").insert({
    company_id: company.id,
    user_id: authResult.user.id,
    role: "owner",
  } as never);
  const { error: contactError } = await admin.from("company_contacts").insert({
    company_id: company.id,
    pic_name: name,
    pic_role: "Company owner",
    email,
    phone: null,
    whatsapp: null,
    avatar_url: null,
    is_primary: true,
  } as never);

  if (memberError || contactError) {
    await admin.from("companies").delete().eq("id", company.id);
    await admin.auth.admin.deleteUser(authResult.user.id);
    return { error: copy.registrationError, message: "" };
  }

  return { error: "", message: copy.registrationDone };
}
