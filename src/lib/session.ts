// Minimal phone-number login: an HMAC-signed cookie holding the seller id.
// Prototype-grade on purpose (multi-user auth is out of scope). No OTP yet.
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { config } from "./config";
import { db } from "./db";

const COOKIE = "gs_session";

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
  (await cookies()).set(COOKIE, encodeSession(sellerId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

export async function currentSeller() {
  const id = decodeSession((await cookies()).get(COOKIE)?.value);
  if (!id) return null;
  return db.seller.findUnique({ where: { id } });
}
