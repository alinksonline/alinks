import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { destroySession } from "@/platform/auth/session";

export async function POST() {
  await destroySession();
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return NextResponse.redirect(new URL("/login", `${proto}://${host}`));
}