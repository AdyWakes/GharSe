import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { isLang } from "@/lib/i18n";
import { LANG_COOKIE } from "@/lib/lang";
import { currentSeller } from "@/lib/session";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { lang?: string };
  if (!isLang(body.lang)) return NextResponse.json({ error: "invalid_lang" }, { status: 400 });

  (await cookies()).set(LANG_COOKIE, body.lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  const seller = await currentSeller();
  if (seller) await db.seller.update({ where: { id: seller.id }, data: { language: body.lang } });
  return NextResponse.json({ ok: true });
}
