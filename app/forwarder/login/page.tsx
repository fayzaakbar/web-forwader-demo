import { LoginForm } from "@/components/LoginForm";
import { RoleAccessPanel } from "@/components/RoleAccessPanel";
import { getLocale } from "@/lib/i18n";
import { areWorkspacesEnabled, isDemoRolePreview } from "@/lib/workspaces";

export default async function ForwarderLoginPage() {
  const locale = await getLocale();
  if (isDemoRolePreview()) return <RoleAccessPanel role="forwarder" locale={locale} demo enabled={false} />;
  if (!areWorkspacesEnabled()) return <RoleAccessPanel role="forwarder" locale={locale} demo={false} enabled={false} />;
  return <LoginForm role="forwarder" locale={locale} />;
}
