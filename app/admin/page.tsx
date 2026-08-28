import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { listAllAds } from "@/lib/ads";
import { AdminDashboard } from "@/components/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const ads = await listAllAds();
  return <AdminDashboard initialAds={ads} />;
}
