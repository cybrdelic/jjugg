import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Performance optimizations
  experimental: {
    optimizeCss: false,
  },

  trailingSlash: false,

  // Enable compression
  compress: true,

  // Optimize images
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },

  // Exclude server-only files from client bundle
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // Webpack optimizations
  webpack: (config: any, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
    // Enable webpack caching for faster builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };

      // Exclude database scripts and migrations from client bundle
      config.externals = config.externals || [];
      config.externals.push({
        'commander': 'commander',
        './database/scripts': 'empty',
        './database/migrations': 'empty'
      });
    }

    return config;
  },
}

export default nextConfig;
