import { NextResponse } from "next/server";
import { createAdminSession, verifyAdminPassword } from "@/lib/auth";
import { isAdminConfigured } from "@/lib/admin-settings";

export async function POST(request: Request) {
  if (!(await isAdminConfigured())) {
    return NextResponse.json({ error: "not_configured" }, { status: 409 });
  }

  const body = await request.json().catch(() => ({}));
  const valid = await verifyAdminPassword(String(body.password ?? ""));

  if (!valid) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
