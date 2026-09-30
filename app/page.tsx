import { DirectoryExplorer } from "@/components/DirectoryExplorer";
import { getAllServiceCategories, getForwarders } from "@/lib/data";
import { getLocale } from "@/lib/i18n";

export default async function DirectoryPage() {
  const locale = await getLocale();
  const forwarders = await getForwarders();
  const categories = getAllServiceCategories(forwarders);

  return <DirectoryExplorer forwarders={forwarders} categories={categories} locale={locale} />;
}
