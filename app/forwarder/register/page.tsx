import { RoleAccessPanel } from "@/components/RoleAccessPanel";
import { ForwarderRegistrationForm } from "@/components/ForwarderRegistrationForm";
import { getLocale } from "@/lib/i18n";
import { areWorkspacesEnabled, isDemoForwarderPreview } from "@/lib/workspaces";

export default async function ForwarderRegistrationPage() {
  const locale = await getLocale();
  const demo = isDemoForwarderPreview();
  const enabled = areWorkspacesEnabled();
  if (!demo && !enabled) return <RoleAccessPanel role="forwarder" locale={locale} demo={false} enabled={false} />;
  return <ForwarderRegistrationForm locale={locale} demo={demo} />;
}
