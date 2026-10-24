// Web chat simulator adapter. Outbound messages are already stored in the
// Message table by the router; the browser fetches them, so delivery is a no-op.
// This keeps the primary demo surface working with zero external setup.
import type { ChannelAdapter } from "./types";

export const simulatorAdapter: ChannelAdapter = {
  name: "sim",
  async deliver() {
    // Nothing to push: the chat page reads new rows via /api/sim/messages.
  },
};
