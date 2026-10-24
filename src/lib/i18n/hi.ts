// Hindi UI strings. Everyday spoken Hindi, not formal or Sanskritised.
// English words people already use (mobile, photo, demo) stay as they are.
import type { MessageKey } from "./en";

export const hi: Record<MessageKey, string> = {
  appName: "GharSe",
  tagline: "घर की रसोई से दुकान तक",

  "login.title": "अपना मोबाइल नंबर डालें",
  "login.hint": "इससे हम आपके प्रोडक्ट ढूंढते हैं, और कुछ नहीं।",
  "login.placeholder": "10 अंक का मोबाइल नंबर",
  "login.button": "आगे बढ़ें",
  "login.invalid": "सही 10 अंक का मोबाइल नंबर डालें",
  "login.demo": "डेमो खोलें",

  "chat.assistantName": "GharSe सहायक",
  "chat.online": "ऑनलाइन",
  "chat.placeholder": "मैसेज लिखें",
  "chat.send": "भेजें",
  "chat.photo": "फोटो भेजें",
  "chat.mic": "बोलकर भेजें",
  "chat.recording": "रिकॉर्ड हो रहा है",
  "chat.cancel": "रद्द करें",
  "chat.micDenied": "माइक की इजाज़त नहीं मिली",
  "chat.micUnsupported": "इस ब्राउज़र में आवाज़ रिकॉर्ड नहीं होती",
  "chat.sending": "भेज रहे हैं",
  "chat.failed": "नहीं गया। दोबारा भेजने के लिए दबाएं",
  "chat.voiceNote": "आवाज़ संदेश",
  "chat.heard": "हमने सुना",
  "chat.photoAlt": "आपकी भेजी फोटो",
  "chat.today": "आज",
  "chat.empty": "नमस्ते लिखें, या अपनी रेसिपी बोलकर भेजें।",

  "nav.chat": "चैट",
  "nav.dashboard": "मेरे प्रोडक्ट",
  "nav.logout": "बाहर निकलें",
  "nav.switchLang": "English",

  "mock.badge": "डेमो मोड",
  "mock.title": "ये सेवाएं अभी डेमो में चल रही हैं",
  "mock.llm": "AI समझ",
  "mock.stt": "आवाज़ से लिखाई",
  "mock.tts": "लिखाई से आवाज़",
  "mock.usda": "पोषण जानकारी (USDA)",
  "mock.whatsapp": "WhatsApp",
  "mock.live": "चालू",
  "mock.mock": "डेमो",

  "dash.title": "मेरे प्रोडक्ट",
  "dash.empty": "अभी कोई प्रोडक्ट नहीं है। चैट में अपनी रेसिपी भेजें।",
  "dash.pack": "पैक",
  "dash.price": "आपका दाम",
  "dash.noPrice": "तय नहीं",
  "dash.batches": "बैच",
  "dash.comingSoon": "तैयारी, लेबल और बैच यहां दिखेंगे।",
};
