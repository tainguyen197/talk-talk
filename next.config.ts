import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Enable streaming responses for OpenAI */
  serverExternalPackages: ["openai"],
  /* Increase the body size limit for audio uploads */
};

export default nextConfig;
