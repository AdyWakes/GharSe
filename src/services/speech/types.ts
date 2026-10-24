// Speech interfaces. Sarvam AI is the live provider (phase 5); mocks keep the
// demo running end to end without a key.
import type { Lang } from "@/lib/i18n";

export interface Transcript {
  text: string;
  language: Lang;
  provider: "sarvam" | "mock";
}

export interface SpeechToText {
  transcribe(audio: Buffer, mime: string, hint: Lang): Promise<Transcript>;
}

export interface SynthesizedAudio {
  bytes: Buffer;
  mime: string;
}

export interface TextToSpeech {
  /** Returns null when no audio can be produced (the text reply still goes out). */
  synthesize(text: string, lang: Lang): Promise<SynthesizedAudio | null>;
}
