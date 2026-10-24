// Tiny typed i18n. Adding a language = add a dictionary file and list it here.
import { en, type MessageKey } from "./en";
import { hi } from "./hi";

export const LANGS = ["hi", "en"] as const;
export type Lang = (typeof LANGS)[number];
export type { MessageKey };

const dictionaries: Record<Lang, Record<MessageKey, string>> = { hi, en };

export function isLang(v: unknown): v is Lang {
  return typeof v === "string" && (LANGS as readonly string[]).includes(v);
}

export function asLang(v: unknown): Lang {
  return isLang(v) ? v : "hi";
}

/** Look up a UI string. `{name}` placeholders are filled from `vars`. */
export function t(lang: Lang, key: MessageKey, vars?: Record<string, string | number>): string {
  let s = dictionaries[lang][key] ?? dictionaries.en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

/** Binds a language so components can call tr("key"). */
export function translator(lang: Lang) {
  return (key: MessageKey, vars?: Record<string, string | number>) => t(lang, key, vars);
}

export function dictionary(lang: Lang): Record<MessageKey, string> {
  return dictionaries[lang];
}
