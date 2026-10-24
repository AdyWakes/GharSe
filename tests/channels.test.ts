import { describe, expect, it } from "vitest";
import { MAX_QUICK_REPLIES, MAX_QUICK_REPLY_TITLE, normalizeButtons } from "@/channels/types";

describe("normalizeButtons", () => {
  it("drops empty lists", () => {
    expect(normalizeButtons(undefined)).toBeUndefined();
    expect(normalizeButtons([])).toBeUndefined();
  });

  it("keeps at most 3 buttons with titles of at most 20 characters (WhatsApp limits)", () => {
    const out = normalizeButtons(
      Array.from({ length: 5 }, (_, i) => ({ id: `b${i}`, title: "क".repeat(30) })),
    )!;
    expect(out).toHaveLength(MAX_QUICK_REPLIES);
    for (const b of out) expect(Array.from(b.title)).toHaveLength(MAX_QUICK_REPLY_TITLE);
  });
});
