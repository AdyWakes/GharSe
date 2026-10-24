// Phase 1 placeholder agent. It proves the pipe end to end (channel, storage,
// speech-to-text, decision log, reply) without any intelligence. Phase 3
// replaces respond() with the planner + LLM tool loop; the signature stays.
import type { Message, Seller } from "@prisma/client";
import type { OutboundMessage } from "@/channels/types";
import { asLang } from "@/lib/i18n";
import { logDecision } from "./decisions";

export interface AgentInput {
  seller: Seller;
  /** The stored inbound message, transcript already filled for audio. */
  message: Message;
}

export async function respond({ seller, message }: AgentInput): Promise<OutboundMessage[]> {
  const lang = asLang(seller.language);
  const name = seller.name?.split(" ")[0];
  const hi = lang === "hi";

  let reply: OutboundMessage;
  let reason: string;

  if (message.kind === "audio") {
    const heard = message.transcript ?? "";
    reply = {
      kind: "text",
      text: hi
        ? `मैंने आपका आवाज़ संदेश सुना:\n\n_${heard}_\n\nइससे रेसिपी बनाने का काम अगले अपडेट में जुड़ेगा।`
        : `I heard your voice note:\n\n_${heard}_\n\nTurning this into a recipe comes in the next update.`,
    };
    reason = "Voice note received; echoed the transcript so she can see what was heard.";
  } else if (message.kind === "image") {
    reply = {
      kind: "text",
      text: hi
        ? "फोटो मिल गई। रेसिपी की फोटो पढ़ने का काम अगले अपडेट में जुड़ेगा।"
        : "Got your photo. Reading recipe photos comes in the next update.",
    };
    reason = "Photo received; recipe reading is not built yet, so acknowledged it.";
  } else {
    reply = {
      kind: "text",
      text: hi
        ? `नमस्ते${name ? ` ${name} जी` : ""}! मैं GharSe सहायक हूँ। अपनी रेसिपी बोलकर या फोटो से भेजें।`
        : `Namaste${name ? ` ${name}` : ""}! I am the GharSe assistant. Send your recipe as a voice note or a photo.`,
      buttons: [
        { id: "help_recipe", title: hi ? "रेसिपी भेजनी है" : "Send a recipe" },
        { id: "help_price", title: hi ? "दाम जानना है" : "Check my price" },
      ],
    };
    reason = "Text message received; greeted her and offered the two most common starting points.";
  }

  await logDecision({
    sellerId: seller.id,
    action: "placeholder_reply",
    reason,
    detail: { inboundMessageId: message.id, inboundKind: message.kind },
    actor: "system",
  });

  return [reply];
}
