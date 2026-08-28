import { NextResponse } from "next/server";
import { incrementView } from "@/lib/ads";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await incrementView(id);
  return NextResponse.json({ ok: true });
}
