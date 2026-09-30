"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { areWorkspacesEnabled } from "@/lib/workspaces";
import type { Database, VerificationStatus } from "@/types/database";

const allowedStatuses: VerificationStatus[] = ["pending", "verified", "rejected"];

export async function updateCompanyVerification(formData: FormData) {
  if (!areWorkspacesEnabled()) redirect("/");
  const companyId = String(formData.get("company_id") ?? "");
  const status = String(formData.get("verified_status") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(companyId) || !allowedStatuses.includes(status as VerificationStatus)) {
    redirect("/admin?error=invalid");
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?setup=1");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=%2Fadmin");

  const { data: admin } = await supabase
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!admin) redirect("/unauthorized");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) redirect("/admin?error=server-config");

  const serviceClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await serviceClient
    .from("companies")
    .update({ verified_status: status as VerificationStatus })
    .eq("id", companyId);
  if (error) redirect("/admin?error=update");

  revalidatePath("/admin");
}
