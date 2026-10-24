// Integration: the full inbound pipe against a throwaway SQLite database.
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { handleInbound } from "@/channels/router";
import { db } from "@/lib/db";
import { DEMO_PHONE, seedDemo } from "@/lib/demo-seed";
import { MOCK_TRANSCRIPT_HI } from "@/services/speech/mock";

const PHONE = "+919812345678";

beforeEach(async () => {
  await db.seller.deleteMany({ where: { phone: PHONE } });
});
afterAll(() => db.$disconnect());

describe("handleInbound", () => {
  it("creates the seller, stores the message, replies and logs a decision", async () => {
    const turn = await handleInbound({ channel: "sim", from: PHONE, kind: "text", text: "namaste" });
    expect(turn.duplicate).toBe(false);
    expect(turn.inbound.direction).toBe("in");
    expect(turn.replies).toHaveLength(1);
    expect(turn.replies[0].direction).toBe("out");
    expect(JSON.parse(turn.replies[0].buttons!)).toHaveLength(2);

    const seller = await db.seller.findUniqueOrThrow({ where: { phone: PHONE } });
    const decisions = await db.decisionLog.findMany({ where: { sellerId: seller.id } });
    expect(decisions).toHaveLength(1);
    expect(decisions[0].reason.length).toBeGreaterThan(10);
  });

  it("stores a voice note and transcribes it (mock speech)", async () => {
    const turn = await handleInbound({
      channel: "sim",
      from: PHONE,
      kind: "audio",
      media: { bytes: Buffer.from("fake-opus"), mime: "audio/webm" },
    });
    expect(turn.inbound.mediaPath).toMatch(/\.webm$/);
    expect(turn.inbound.transcript).toBe(MOCK_TRANSCRIPT_HI);
    expect(turn.replies[0].text).toContain(MOCK_TRANSCRIPT_HI);
  });

  it("ignores a channel message it has already seen", async () => {
    const first = await handleInbound({ channel: "sim", from: PHONE, kind: "text", text: "hi", externalId: "wamid.1" });
    const again = await handleInbound({ channel: "sim", from: PHONE, kind: "text", text: "hi", externalId: "wamid.1" });
    expect(again.duplicate).toBe(true);
    expect(again.inbound.id).toBe(first.inbound.id);
    expect(again.replies).toHaveLength(0);
  });
});

describe("seedDemo", () => {
  it("creates the demo seller with two confirmed products and can run twice", async () => {
    await seedDemo(db);
    const { products } = await seedDemo(db);
    expect(products.map((p) => p.slug).sort()).toEqual(["AAC", "BLD"]);
    for (const p of products) {
      expect(p.recipes[0].status).toBe("confirmed");
      expect(p.recipes[0].ingredients.every((i) => i.grams! > 0 && i.conversionConfirmed)).toBe(true);
    }
    expect(await db.seller.count({ where: { phone: DEMO_PHONE } })).toBe(1);
    expect(await db.foodSafetyOfficer.count()).toBe(1);
  });
});
