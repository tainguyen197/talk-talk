import type { NextConfig } from "next";
// @ts-expect-error - next-pwa doesn't have proper TypeScript definitions
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  /* Enable streaming responses for OpenAI */
  serverExternalPackages: ["openai"],
  /* Increase the body size limit for audio uploads */
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

export default pwaConfig(nextConfig);
