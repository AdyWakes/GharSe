import { describe, expect, it } from "vitest";
import { decodeSession, encodeSession } from "@/lib/session";

describe("session token", () => {
  it("round-trips a seller id", () => {
    expect(decodeSession(encodeSession("seller_123"))).toBe("seller_123");
  });

  it("rejects a tampered id or signature", () => {
    const token = encodeSession("seller_123");
    const sig = token.slice(token.lastIndexOf(".") + 1);
    expect(decodeSession(`seller_999.${sig}`)).toBeNull();
    expect(decodeSession(`${token.slice(0, -2)}xx`)).toBeNull();
  });

  it("rejects missing or malformed tokens", () => {
    expect(decodeSession(undefined)).toBeNull();
    expect(decodeSession("")).toBeNull();
    expect(decodeSession("no-dot-here")).toBeNull();
  });
});
