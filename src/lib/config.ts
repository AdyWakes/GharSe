// Central place that decides which external services are live and which are
// mocked. Any missing key means that service runs as a realistic mock, so the
// full demo works with zero setup.

export type ServiceName = "llm" | "stt" | "tts" | "usda" | "whatsapp";

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() !== "" ? v.trim() : undefined;
}

const forceMock = env("MOCK_MODE") === "1";

export const config = {
  appBaseUrl: env("APP_BASE_URL") ?? "http://localhost:3000",
  sessionSecret: env("SESSION_SECRET") ?? "dev-only-secret-change-me",
  anthropic: {
    apiKey: env("ANTHROPIC_API_KEY"),
    model: env("ANTHROPIC_MODEL") ?? "claude-sonnet-5-5",
  },
  sarvam: { apiKey: env("SARVAM_API_KEY") },
  usda: { apiKey: env("USDA_FDC_API_KEY") },
  whatsapp: {
    enabled: env("CHANNEL_WHATSAPP") === "1",
    phoneNumberId: env("WHATSAPP_PHONE_NUMBER_ID"),
    accessToken: env("WHATSAPP_ACCESS_TOKEN"),
    appSecret: env("WHATSAPP_APP_SECRET"),
    verifyToken: env("WHATSAPP_VERIFY_TOKEN"),
  },
  storageDir: env("STORAGE_DIR") ?? "storage",
};

export function isLive(service: ServiceName): boolean {
  if (forceMock) return false;
  switch (service) {
    case "llm":
      return !!config.anthropic.apiKey;
    case "stt":
    case "tts":
      return !!config.sarvam.apiKey;
    case "usda":
      return !!config.usda.apiKey;
    case "whatsapp":
      return (
        config.whatsapp.enabled &&
        !!config.whatsapp.accessToken &&
        !!config.whatsapp.phoneNumberId
      );
  }
}

export function serviceModes(): Record<ServiceName, "live" | "mock"> {
  const names: ServiceName[] = ["llm", "stt", "tts", "usda", "whatsapp"];
  return Object.fromEntries(names.map((n) => [n, isLive(n) ? "live" : "mock"])) as Record<
    ServiceName,
    "live" | "mock"
  >;
}
