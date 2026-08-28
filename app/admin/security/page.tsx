import { redirect } from "next/navigation";
import { AdminSecurityForm } from "@/components/admin-security-form";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminSecurityPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return <main className="grid min-h-screen place-items-center px-5"><AdminSecurityForm /></main>;
}
