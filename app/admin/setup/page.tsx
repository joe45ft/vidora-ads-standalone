import { redirect } from "next/navigation";
import { AdminSetupForm } from "@/components/admin-setup-form";
import { isAdminConfigured } from "@/lib/admin-settings";

export const dynamic = "force-dynamic";

export default async function AdminSetupPage() {
  if (await isAdminConfigured()) redirect("/admin/login");

  return (
    <main className="grid min-h-screen place-items-center px-5">
      <AdminSetupForm />
    </main>
  );
}
