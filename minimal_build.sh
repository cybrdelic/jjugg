#!/bin/bash

# Create a minimal development package.json
cat > dev_pkg.json << 'EOL'
{
  "name": "jjugg-test-dev",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "echo 'Build skipped - dev environment only'"
  },
  "dependencies": {
    "next": "15.2.2",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5"
  }
}
EOL

# Create a minimal Next.js config
cat > dev_next.config.js << 'EOL'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};

module.exports = nextConfig;
EOL

echo "=== Development Environment Setup ==="
echo ""
echo "Two options for development:"
echo ""
echo "1. Use minimal dev setup (faster):"
echo "   mv package.json package.json.bak"
echo "   mv dev_pkg.json package.json"
echo "   mv next.config.ts next.config.ts.bak"
echo "   mv dev_next.config.js next.config.js"
echo "   npm install"
echo "   npm run dev"
echo ""
echo "2. Use Turbopack (may be more stable):"
echo "   npm run dev -- --no-turbo"
echo ""
echo "If you're still having problems, try cleaning cache:"
echo "   rm -rf .next"
echo "   npm cache clean --force"
echo "   npm install"
echo ""