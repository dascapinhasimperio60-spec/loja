import { SettingsForm } from "@/components/admin/settings-form";
import { getAdminSettings } from "@/lib/admin/queries";

export const metadata = { title: "Dados da loja" };

export default async function SettingsPage() {
  const settings = await getAdminSettings();
  return <SettingsForm settings={settings} />;
}
