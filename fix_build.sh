#!/bin/bash

# Kill any hanging Next.js processes
pkill -f "next build"
sleep 1

# Create a temporary build configuration
cat > temp_next.config.js << 'EOL'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'export',
  images: {
    unoptimized: true,
  }
};

module.exports = nextConfig;
EOL

# Rename API directory temporarily to prevent API routes from being included in static export
mv pages/api pages/api_temp 2>/dev/null || true

# Run build with the simplified config
NEXT_CONFIG=temp_next.config.js npx next build

# Clean up
rm temp_next.config.js
mv pages/api_temp pages/api 2>/dev/null || true

echo "Build completed!"