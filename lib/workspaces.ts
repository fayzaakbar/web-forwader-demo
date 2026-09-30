export function areWorkspacesEnabled() {
  return process.env.NEXT_PUBLIC_WORKSPACES_ENABLED === "true"
    && Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)
    && Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function isDemoRolePreview() {
  return process.env.NODE_ENV !== "production" && !areWorkspacesEnabled();
}

export function isDemoForwarderPreview() {
  return !areWorkspacesEnabled();
}
