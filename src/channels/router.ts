// The one path every inbound message takes, whatever the channel:
// store it, transcribe voice, ask the agent, store and deliver the replies.
import type { Message } from "@prisma/client";
import { respond } from "@/agent/respond";
import { db } from "@/lib/db";
import { asLang } from "@/lib/i18n";
import { saveMedia } from "@/lib/storage";
import { speechToText } from "@/services/speech";
import { adapterFor } from "./index";
import { normalizeButtons, type InboundMessage } from "./types";

export interface HandledTurn {
  inbound: Message;
  replies: Message[];
  duplicate: boolean;
}

export async function handleInbound(msg: InboundMessage): Promise<HandledTurn> {
  if (msg.externalId) {
    const seen = await db.message.findFirst({ where: { externalId: msg.externalId } });
    if (seen) return { inbound: seen, replies: [], duplicate: true };
  }

  const seller = await db.seller.upsert({
    where: { phone: msg.from },
    create: { phone: msg.from },
    update: {},
  });

  const mediaPath = msg.media ? await saveMedia(seller.id, msg.media.bytes, msg.media.mime) : null;

  let transcript: string | null = null;
  if (msg.kind === "audio" && msg.media) {
    const result = await speechToText().transcribe(msg.media.bytes, msg.media.mime, asLang(seller.language));
    transcript = result.text;
  }

  const inbound = await db.message.create({
    data: {
      sellerId: seller.id,
      channel: msg.channel,
      direction: "in",
      kind: msg.kind,
      text: msg.text ?? null,
      mediaPath,
      mediaMime: msg.media?.mime ?? null,
      transcript,
      externalId: msg.externalId ?? null,
    },
  });

  const outbound = await respond({ seller, message: inbound });
  const adapter = adapterFor(msg.channel);
  const replies: Message[] = [];

  for (const out of outbound) {
    const buttons = normalizeButtons(out.buttons);
    const stored = await db.message.create({
      data: {
        sellerId: seller.id,
        channel: msg.channel,
        direction: "out",
        kind: buttons ? "buttons" : out.kind,
        text: out.text ?? null,
        mediaPath: out.mediaPath ?? null,
        mediaMime: out.mediaMime ?? null,
        buttons: buttons ? JSON.stringify(buttons) : null,
      },
    });
    await adapter.deliver({ to: seller.phone, messageId: stored.id, message: { ...out, buttons } });
    replies.push(stored);
  }

  return { inbound, replies, duplicate: false };
}
