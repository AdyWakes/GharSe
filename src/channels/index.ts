import { simulatorAdapter } from "./simulator";
import { whatsappAdapter } from "./whatsapp";
import type { ChannelAdapter, ChannelName } from "./types";

const adapters: Record<ChannelName, ChannelAdapter> = {
  sim: simulatorAdapter,
  whatsapp: whatsappAdapter,
};

export function adapterFor(name: ChannelName): ChannelAdapter {
  return adapters[name];
}

export * from "./types";
