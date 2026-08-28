import { redirect } from "next/navigation";
import { AdminRecoveryForm } from "@/components/admin-recovery-form";
import { isAdminConfigured } from "@/lib/admin-settings";

export const dynamic = "force-dynamic";

export default async function AdminRecoverPage() {
  if (!(await isAdminConfigured())) redirect("/admin/setup");
  return <main className="grid min-h-screen place-items-center px-5"><AdminRecoveryForm /></main>;
}
