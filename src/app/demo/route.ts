// GET /demo: resets the demo seller to the seed data and logs in as her.
// Phase 6 adds a confirmation screen and a reset button on the dashboard.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { seedDemo } from "@/lib/demo-seed";
import { encodeSession, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { seller } = await seedDemo(db);
  const res = NextResponse.redirect(new URL("/chat", req.url));
  res.cookies.set(SESSION_COOKIE, encodeSession(seller.id), SESSION_COOKIE_OPTIONS);
  return res;
}
