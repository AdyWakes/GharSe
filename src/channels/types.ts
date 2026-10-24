// Channel adapter contract. The agent never knows which channel it is on:
// adapters turn channel payloads into InboundMessage and deliver OutboundMessage.

export type ChannelName = "sim" | "whatsapp";

export type InboundKind = "text" | "image" | "audio" | "button";

export interface InboundMessage {
  channel: ChannelName;
  /** Sender phone in E.164 (+91...). */
  from: string;
  kind: InboundKind;
  text?: string;
  /** Raw media bytes for image/audio. Stored before the agent sees the message. */
  media?: { bytes: Buffer; mime: string };
  /** Id of the quick-reply button she tapped, for kind "button". */
  buttonId?: string;
  /** Channel's own message id (WhatsApp wamid), used for de-duplication. */
  externalId?: string;
}

/**
 * Quick replies. WhatsApp allows at most 3 reply buttons with titles up to
 * 20 characters, so the simulator enforces the same limits.
 */
export interface QuickReply {
  id: string;
  title: string;
}

export const MAX_QUICK_REPLIES = 3;
export const MAX_QUICK_REPLY_TITLE = 20;

export type OutboundKind = "text" | "audio" | "image" | "document";

export interface OutboundMessage {
  kind: OutboundKind;
  text?: string;
  /** Storage-relative path for audio/image/document messages. */
  mediaPath?: string;
  mediaMime?: string;
  /** File name shown for documents (e.g. the label PDF). */
  fileName?: string;
  buttons?: QuickReply[];
}

/** What an adapter needs to deliver one stored outbound message. */
export interface Delivery {
  to: string; // E.164 phone
  messageId: string; // our Message row id
  message: OutboundMessage;
}

export interface ChannelAdapter {
  name: ChannelName;
  deliver(delivery: Delivery): Promise<void>;
}

/** Trims quick replies to what every channel can show. */
export function normalizeButtons(buttons: QuickReply[] | undefined): QuickReply[] | undefined {
  if (!buttons?.length) return undefined;
  return buttons.slice(0, MAX_QUICK_REPLIES).map((b) => ({
    id: b.id,
    title: Array.from(b.title).slice(0, MAX_QUICK_REPLY_TITLE).join(""),
  }));
}
