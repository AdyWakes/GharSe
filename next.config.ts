import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Playwright and Prisma must stay server-side and unbundled.
  serverExternalPackages: ["playwright", "@prisma/client"],
  experimental: {
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
