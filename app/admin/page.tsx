import { redirect } from "next/navigation";
import { isAdminConfigured } from "@/lib/admin-settings";
import { isAdminAuthenticated } from "@/lib/auth";
import { listAllAds } from "@/lib/ads";
import { getSiteSettings } from "@/lib/site-settings";
import { AdminDashboard } from "@/components/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminConfigured())) redirect("/admin/setup");
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const [ads, settings] = await Promise.all([listAllAds(), getSiteSettings()]);
  return <AdminDashboard initialAds={ads} siteName={settings.siteName} />;
}
