import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Disable optimizeCss since it requires critters
  experimental: {
    optimizeCss: false,
  },
  // Add trailing slash to avoid issues with data routes
  trailingSlash: true,
};

export default nextConfig;
