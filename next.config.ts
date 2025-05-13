import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Enable streaming responses for OpenAI */
  experimental: {
    serverComponentsExternalPackages: ["openai"],
  },
  /* Increase the body size limit for audio uploads */
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default nextConfig;
