import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Disable experimental features
    optimizeCss: false
  },
  trailingSlash: false,

  // Webpack configuration
  webpack: (config: any, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
    return config;
  }
}

export default nextConfig;
