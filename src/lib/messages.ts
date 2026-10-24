// Shape of a chat message as the browser sees it.
import type { Message } from "@prisma/client";
import type { QuickReply } from "@/channels/types";
import { mediaUrl } from "./storage";

export interface ClientMessage {
  id: string;
  direction: "in" | "out";
  kind: string;
  text: string | null;
  mediaUrl: string | null;
  mediaMime: string | null;
  transcript: string | null;
  buttons: QuickReply[] | null;
  createdAt: string;
}

export function toClientMessage(m: Message): ClientMessage {
  return {
    id: m.id,
    direction: m.direction === "in" ? "in" : "out",
    kind: m.kind,
    text: m.text,
    mediaUrl: m.mediaPath ? mediaUrl(m.mediaPath) : null,
    mediaMime: m.mediaMime,
    transcript: m.transcript,
    buttons: m.buttons ? (JSON.parse(m.buttons) as QuickReply[]) : null,
    createdAt: m.createdAt.toISOString(),
  };
}
