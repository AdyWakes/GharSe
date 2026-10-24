// English UI strings. Every key here must also exist in hi.ts (enforced by type).
// Keep copy short and plain. No em dashes anywhere in UI copy.
export const en = {
  appName: "GharSe",
  tagline: "From home kitchen to store shelf",

  "login.title": "Enter your mobile number",
  "login.hint": "We use it only to find your products.",
  "login.placeholder": "10-digit mobile number",
  "login.button": "Continue",
  "login.invalid": "Enter a valid 10-digit mobile number",
  "login.demo": "Open the demo",

  "chat.assistantName": "GharSe Assistant",
  "chat.online": "online",
  "chat.placeholder": "Type a message",
  "chat.send": "Send",
  "chat.photo": "Send a photo",
  "chat.mic": "Record a voice note",
  "chat.recording": "Recording",
  "chat.cancel": "Cancel",
  "chat.micDenied": "Microphone permission was not given",
  "chat.micUnsupported": "Voice recording does not work in this browser",
  "chat.sending": "Sending",
  "chat.failed": "Not sent. Tap to try again",
  "chat.voiceNote": "Voice note",
  "chat.heard": "Heard",
  "chat.photoAlt": "Photo you sent",
  "chat.today": "Today",
  "chat.empty": "Say namaste, or send a voice note about your recipe.",

  "nav.chat": "Chat",
  "nav.dashboard": "My products",
  "nav.logout": "Log out",
  "nav.switchLang": "हिंदी",

  "mock.badge": "Demo mode",
  "mock.title": "These services are running as demos",
  "mock.llm": "AI understanding",
  "mock.stt": "Voice to text",
  "mock.tts": "Text to voice",
  "mock.usda": "Nutrition lookup (USDA)",
  "mock.whatsapp": "WhatsApp",
  "mock.live": "live",
  "mock.mock": "demo",

  "dash.title": "My products",
  "dash.empty": "No products yet. Send your recipe in the chat.",
  "dash.pack": "Pack",
  "dash.price": "Your price",
  "dash.noPrice": "Not set",
  "dash.batches": "Batches",
  "dash.comingSoon": "Readiness, labels and batches will show here.",
} as const;

export type MessageKey = keyof typeof en;
