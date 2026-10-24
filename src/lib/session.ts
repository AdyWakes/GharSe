// Minimal phone-number login: an HMAC-signed cookie holding the seller id.
// Prototype-grade on purpose (multi-user auth is out of scope). No OTP yet.
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { config } from "./config";
import { db } from "./db";

export const SESSION_COOKIE = "gs_session";
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 90,
};

function sign(value: string): string {
  return createHmac("sha256", config.sessionSecret).update(value).digest("base64url");
}

export function encodeSession(sellerId: string): string {
  return `${sellerId}.${sign(sellerId)}`;
}

export function decodeSession(token: string | undefined): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const id = token.slice(0, dot);
  const given = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(sign(id));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  return id;
}

export async function setSession(sellerId: string) {
  (await cookies()).set(SESSION_COOKIE, encodeSession(sellerId), SESSION_COOKIE_OPTIONS);
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function currentSeller() {
  const id = decodeSession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!id) return null;
  return db.seller.findUnique({ where: { id } });
}
