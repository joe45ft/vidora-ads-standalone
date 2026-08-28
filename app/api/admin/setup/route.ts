import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/auth";
import { isAdminConfigured, setupAdmin } from "@/lib/admin-settings";

export async function GET() {
  return NextResponse.json({ configured: await isAdminConfigured() });
}

export async function POST(request: Request) {
  if (await isAdminConfigured()) {
    return NextResponse.json({ error: "already_configured" }, { status: 409 });
  }

  const body = await request.json().catch(() => ({}));
  const password = String(body.password ?? "");

  if (password.length < 8 || password.length > 128) {
    return NextResponse.json({ error: "invalid_password" }, { status: 400 });
  }

  try {
    await setupAdmin(password);
    await createAdminSession();
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (String(error).includes("ADMIN_ALREADY_CONFIGURED")) {
      return NextResponse.json({ error: "already_configured" }, { status: 409 });
    }
    return NextResponse.json({ error: "setup_failed" }, { status: 500 });
  }
}
