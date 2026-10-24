import { mockSpeechToText, mockTextToSpeech } from "./mock";
import type { SpeechToText, TextToSpeech } from "./types";

// Phase 5 adds the Sarvam implementations, picked when isLive("stt"/"tts").
// Until then every call uses the mocks, which config.serviceModes() reports.
export function speechToText(): SpeechToText {
  return mockSpeechToText;
}

export function textToSpeech(): TextToSpeech {
  return mockTextToSpeech;
}

export type * from "./types";
