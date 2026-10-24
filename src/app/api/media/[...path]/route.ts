// Serves stored media to the seller who owns it (storage/<sellerId>/...).
import { NextResponse } from "next/server";
import { currentSeller } from "@/lib/session";
import { mimeForPath, readMedia } from "@/lib/storage";

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const seller = await currentSeller();
  const { path } = await ctx.params;
  if (!seller || path[0] !== seller.id) return new NextResponse("Not found", { status: 404 });

  const rel = path.join("/");
  try {
    const bytes = await readMedia(rel);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": mimeForPath(rel),
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
