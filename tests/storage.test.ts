import { describe, expect, it } from "vitest";
import { extForMime, mimeForPath, readMedia, resolveMedia, saveMedia } from "@/lib/storage";

describe("media storage", () => {
  it("saves and reads back bytes under the seller's folder", async () => {
    const rel = await saveMedia("sellerA", Buffer.from("hello"), "audio/webm;codecs=opus");
    expect(rel).toMatch(/^sellerA\/[0-9a-f-]+\.webm$/);
    expect((await readMedia(rel)).toString()).toBe("hello");
  });

  it("refuses paths that escape the storage root", () => {
    expect(() => resolveMedia("../package.json")).toThrow();
    expect(() => resolveMedia("sellerA/../../etc/passwd")).toThrow();
  });

  it("maps mime types and extensions both ways", () => {
    expect(extForMime("image/jpeg")).toBe("jpg");
    expect(extForMime("application/x-unknown")).toBe("bin");
    expect(mimeForPath("a/b.ogg")).toBe("audio/ogg");
    expect(mimeForPath("a/b.xyz")).toBe("application/octet-stream");
  });
});
