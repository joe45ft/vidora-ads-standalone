import { NextResponse } from "next/server";
import { incrementClick } from "@/lib/ads";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await incrementClick(id);
  return NextResponse.json({ ok: true });
}
