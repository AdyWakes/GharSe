// Mock speech. Any voice note is "heard" as the demo lime-pickle recipe, so the
// live demo flow works without a Sarvam key. Swap MOCK_TRANSCRIPT_HI to rehearse
// other recipes.
import type { SpeechToText, TextToSpeech } from "./types";

export const MOCK_TRANSCRIPT_HI =
  "मैं नींबू का अचार बनाती हूँ। तीन किलो नींबू, चार सौ ग्राम नमक, दो कटोरी लाल मिर्च, " +
  "सौ ग्राम हल्दी और एक लीटर सरसों का तेल। एक बार में चार सौ ग्राम वाले पंद्रह जार बनते हैं।";

export const MOCK_TRANSCRIPT_EN =
  "I make lime pickle. Three kilo lime, four hundred gram salt, two katori red chilli, " +
  "one hundred gram turmeric and one litre mustard oil. One batch makes fifteen jars of 400 gram.";

export const mockSpeechToText: SpeechToText = {
  async transcribe(_audio, _mime, hint) {
    return {
      text: hint === "en" ? MOCK_TRANSCRIPT_EN : MOCK_TRANSCRIPT_HI,
      language: hint,
      provider: "mock",
    };
  },
};

export const mockTextToSpeech: TextToSpeech = {
  async synthesize() {
    return null;
  },
};
