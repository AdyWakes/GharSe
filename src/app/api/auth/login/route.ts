import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { asLang } from "@/lib/i18n";
import { LANG_COOKIE } from "@/lib/lang";
import { normalizeIndianPhone } from "@/lib/phone";
import { setSession } from "@/lib/session";

// Phone-number login. No OTP in the prototype (multi-user auth is out of scope).
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { phone?: string };
  const phone = normalizeIndianPhone(body.phone ?? "");
  if (!phone) return NextResponse.json({ error: "invalid_phone" }, { status: 400 });

  const language = asLang((await cookies()).get(LANG_COOKIE)?.value);
  const seller = await db.seller.upsert({
    where: { phone },
    create: { phone, language },
    update: {},
  });
  await setSession(seller.id);
  return NextResponse.json({ ok: true });
}
