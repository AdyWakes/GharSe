// Current UI language: the logged-in seller's choice, else a cookie, else Hindi.
import { cookies } from "next/headers";
import { asLang, type Lang } from "./i18n";
import { currentSeller } from "./session";

export const LANG_COOKIE = "gs_lang";

export async function currentLang(): Promise<Lang> {
  const seller = await currentSeller();
  if (seller) return asLang(seller.language);
  return asLang((await cookies()).get(LANG_COOKIE)?.value);
}
