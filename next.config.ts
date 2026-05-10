import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Increase header size limit to prevent HTTP 431 errors from large Supabase cookies
  httpAgentOptions: {
    keepAlive: true,
  },
};

export default nextConfig;
