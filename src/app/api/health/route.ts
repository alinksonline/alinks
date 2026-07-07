import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    phase: 0,
    service: "alinks",
    timestamp: new Date().toISOString(),
  });
}