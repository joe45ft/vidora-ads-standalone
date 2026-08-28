import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/auth";
import { isAdminConfigured, setupAdmin } from "@/lib/admin-settings";

export async function GET() {
  try {
    return NextResponse.json({ configured: await isAdminConfigured() });
  } catch (error) {
    console.error("Admin setup status failed:", error);
    return NextResponse.json(
      { configured: false, error: "database_unavailable" },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (await isAdminConfigured()) {
      return NextResponse.json({ error: "already_configured" }, { status: 409 });
    }

    const body = await request.json().catch(() => ({}));
    const password = String(body.password ?? "");

    if (password.length < 8 || password.length > 128) {
      return NextResponse.json({ error: "invalid_password" }, { status: 400 });
    }

    await setupAdmin(password);
    await createAdminSession();

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Admin setup failed:", error);

    const message = String(error);

    if (message.includes("ADMIN_ALREADY_CONFIGURED")) {
      return NextResponse.json({ error: "already_configured" }, { status: 409 });
    }

    if (
      message.includes("D1") ||
      message.includes("prepare") ||
      message.includes("DB")
    ) {
      return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
    }

    if (
      message.includes("PBKDF2") ||
      message.includes("deriveBits") ||
      message.includes("OperationError")
    ) {
      return NextResponse.json({ error: "crypto_failed" }, { status: 500 });
    }

    return NextResponse.json({ error: "setup_failed" }, { status: 500 });
  }
}
