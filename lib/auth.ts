import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { areWorkspacesEnabled } from "@/lib/workspaces";
import type { CompanyMemberRecord, CompanyRecord } from "@/types/database";

export async function requireSignedInUser(path: string) {
  if (!areWorkspacesEnabled()) redirect("/");
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/");

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect(`/login?next=${encodeURIComponent(path)}`);
  return { supabase, user };
}

export async function requirePlatformAdmin(path = "/admin") {
  const session = await requireSignedInUser(path);
  const { data, error } = await session.supabase
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (error || !data) redirect("/unauthorized");
  return session;
}

export async function requireForwarderMemberships(path = "/forwarder") {
  const session = await requireSignedInUser(path);
  const { data: membershipRows, error: membershipError } = await session.supabase
    .from("company_members")
    .select("company_id, user_id, role, created_at")
    .eq("user_id", session.user.id);
  const memberships = membershipRows as unknown as CompanyMemberRecord[] | null;
  if (membershipError || !memberships?.length) redirect("/unauthorized");

  const companyIds = memberships.map((membership) => membership.company_id);
  const { data: companyRows, error: companyError } = await session.supabase
    .from("companies")
    .select("*")
    .in("id", companyIds);
  if (companyError) redirect("/unauthorized");

  const companies = companyRows as unknown as CompanyRecord[] | null;
  const companyById = new Map((companies ?? []).map((company) => [company.id, company]));
  return {
    ...session,
    memberships: memberships.flatMap((membership) => {
      const company = companyById.get(membership.company_id);
      return company ? [{ ...membership, company }] : [];
    }),
  };
}

export async function requireForwarderCompany(companyId: string) {
  const path = `/forwarder/companies/${companyId}`;
  const session = await requireSignedInUser(path);
  const { data: membershipRow, error: membershipError } = await session.supabase
    .from("company_members")
    .select("company_id, user_id, role, created_at")
    .eq("company_id", companyId)
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (membershipError || !membershipRow) redirect("/unauthorized");

  const { data: companyRow, error: companyError } = await session.supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .maybeSingle();
  if (companyError || !companyRow) redirect("/unauthorized");

  return {
    ...session,
    membership: membershipRow as unknown as CompanyMemberRecord,
    company: companyRow as unknown as CompanyRecord,
  };
}
