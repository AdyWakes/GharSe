import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { en } from "@/lib/i18n/en";
import { hi } from "@/lib/i18n/hi";
import { asLang, t } from "@/lib/i18n";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    return statSync(p).isDirectory() ? sourceFiles(p) : /\.(ts|tsx)$/.test(p) ? [p] : [];
  });
}

describe("i18n", () => {
  it("has the same keys in Hindi and English", () => {
    expect(Object.keys(hi).sort()).toEqual(Object.keys(en).sort());
  });

  it("has no empty strings", () => {
    for (const [k, v] of [...Object.entries(hi), ...Object.entries(en)]) expect(v.trim(), k).not.toBe("");
  });

  it("falls back to Hindi for unknown languages and fills placeholders", () => {
    expect(asLang("fr")).toBe("hi");
    expect(t("en", "nav.chat")).toBe("Chat");
  });

  it("uses no em or en dashes anywhere in app source (UI copy rule)", () => {
    const offenders = sourceFiles("src").filter((f) => /[–—]/.test(readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
  });
});
