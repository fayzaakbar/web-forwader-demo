"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { areWorkspacesEnabled } from "@/lib/workspaces";
import { messages, type Locale } from "@/lib/messages";

export async function signInAction(_previousState: { error: string }, formData: FormData) {
  if (!areWorkspacesEnabled()) return { error: "Workspace login is temporarily disabled." };
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const expectedRole = String(formData.get("expected_role") ?? "");
  const locale = formData.get("locale") === "en" ? "en" : "id" satisfies Locale;
  const copy = messages[locale];
  if (!email || !password) return { error: "Masukkan email dan password." };
  if (expectedRole !== "admin" && expectedRole !== "forwarder") return { error: copy.roleMismatch };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase belum dikonfigurasi. Isi environment variable lalu coba lagi." };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: copy.invalidCredentials };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Session tidak dapat dibuat. Silakan coba lagi." };

  const { data: admin } = await supabase
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (admin && expectedRole === "admin") redirect("/admin");

  const { data: memberships } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .limit(1);
  if (memberships?.length && expectedRole === "forwarder") redirect("/forwarder");

  await supabase.auth.signOut();
  return { error: copy.roleMismatch };
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/login");
}
