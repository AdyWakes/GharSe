// Chat simulator endpoint: the browser posts what she sends and fetches replies.
import { NextResponse } from "next/server";
import { handleInbound } from "@/channels/router";
import type { InboundKind } from "@/channels/types";
import { db } from "@/lib/db";
import { toClientMessage } from "@/lib/messages";
import { currentSeller } from "@/lib/session";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const KINDS: InboundKind[] = ["text", "image", "audio", "button"];

export async function GET(req: Request) {
  const seller = await currentSeller();
  if (!seller) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const after = new URL(req.url).searchParams.get("after");
  const afterDate = after ? new Date(after) : null;
  const rows = afterDate && !Number.isNaN(afterDate.getTime())
    ? await db.message.findMany({
        where: { sellerId: seller.id, createdAt: { gt: afterDate } },
        orderBy: { createdAt: "asc" },
      })
    : (
        await db.message.findMany({
          where: { sellerId: seller.id },
          orderBy: { createdAt: "desc" },
          take: 50,
        })
      ).reverse();

  return NextResponse.json({ messages: rows.map(toClientMessage) });
}

export async function POST(req: Request) {
  const seller = await currentSeller();
  if (!seller) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const kind = String(form.get("kind") ?? "") as InboundKind;
  if (!KINDS.includes(kind)) return NextResponse.json({ error: "invalid_kind" }, { status: 400 });

  const text = form.get("text");
  const buttonId = form.get("buttonId");
  const file = form.get("file");

  let media: { bytes: Buffer; mime: string } | undefined;
  if (kind === "image" || kind === "audio") {
    if (!(file instanceof File)) return NextResponse.json({ error: "missing_file" }, { status: 400 });
    if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "file_too_large" }, { status: 413 });
    const mime = file.type || (kind === "image" ? "image/jpeg" : "audio/webm");
    if (!mime.startsWith(kind === "image" ? "image/" : "audio/")) {
      return NextResponse.json({ error: "wrong_file_type" }, { status: 400 });
    }
    media = { bytes: Buffer.from(await file.arrayBuffer()), mime };
  } else if (typeof text !== "string" || text.trim() === "") {
    return NextResponse.json({ error: "empty_text" }, { status: 400 });
  }

  const turn = await handleInbound({
    channel: "sim",
    from: seller.phone,
    kind,
    text: typeof text === "string" ? text.trim().slice(0, 4000) : undefined,
    buttonId: typeof buttonId === "string" ? buttonId : undefined,
    media,
  });

  return NextResponse.json({ messages: [turn.inbound, ...turn.replies].map(toClientMessage) });
}
