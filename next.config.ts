import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  devIndicators: false,
  outputFileTracingExcludes: {
    "/*": ["./.runtime/**/*", "./.env*", "./.playwright-mcp/**/*"],
  },
};

export default nextConfig;
