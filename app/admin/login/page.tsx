import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { isAdminConfigured } from "@/lib/admin-settings";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (!(await isAdminConfigured())) redirect("/admin/setup");
  if (await isAdminAuthenticated()) redirect("/admin");

  return (
    <main className="grid min-h-screen place-items-center px-5">
      <AdminLoginForm />
    </main>
  );
}
