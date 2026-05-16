import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No "standalone" output — Vercel uses its own build pipeline
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
