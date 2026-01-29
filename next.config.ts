import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  /* config options here */
  // @ts-expect-error - eslint config missing in type
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
