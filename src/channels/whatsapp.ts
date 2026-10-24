// WhatsApp Cloud API adapter, behind CHANNEL_WHATSAPP=1.
// Phase 1 only reserves the slot so the router can pick a channel by name.
// Webhook verification, inbound parsing, media download and sending land in phase 5.
import { isLive } from "@/lib/config";
import type { ChannelAdapter } from "./types";

export const whatsappAdapter: ChannelAdapter = {
  name: "whatsapp",
  async deliver() {
    if (!isLive("whatsapp")) {
      throw new Error("WhatsApp channel is off. Set CHANNEL_WHATSAPP=1 and the WHATSAPP_* keys.");
    }
    throw new Error("WhatsApp delivery is implemented in phase 5.");
  },
};
