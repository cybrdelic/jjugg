#!/bin/bash
# diagnostics.sh - Collect environment info for Tailwind CLI issues in WSL2

set -e

echo "=================== Environment Diagnostics ==================="
echo ""
echo "1. Node Version:"
node -v
echo ""

echo "2. NPM Version:"
npm -v
echo ""

echo "3. NVM (if installed):"
if command -v nvm >/dev/null 2>&1; then
  nvm --version
else
  echo "nvm not installed."
fi
echo ""

echo "4. Operating System and Kernel Info:"
uname -a
echo ""

echo "5. WSL Detection (looking for 'microsoft' in /proc/version):"
grep -i microsoft /proc/version || echo "WSL not detected"
echo ""

echo "6. NPM Global and User Configs:"
echo "Global config file: $(npm config get globalconfig)"
echo "User config file: $(npm config get userconfig)"
echo ""

echo "7. Current Project .npmrc (if exists):"
if [ -f .npmrc ]; then
  echo ".npmrc content:"
  cat .npmrc
else
  echo ".npmrc not found in project directory."
fi
echo ""

echo "8. Full NPM Config List (long format):"
npm config list -l
echo ""

echo "9. Environment PATH:"
echo "$PATH"
echo ""

echo "10. Check package.json for Tailwind CSS entry:"
grep -i "tailwindcss" package.json || echo "Tailwind not found in package.json."
echo ""

echo "11. Installed Tailwind CSS Version (npm ls):"
npm ls tailwindcss
echo ""

echo "12. Listing node_modules/.bin/ contents:"
if [ -d node_modules/.bin ]; then
  ls -la node_modules/.bin
else
  echo "node_modules/.bin directory not found."
fi
echo ""

echo "13. Checking for Tailwind CLI file:"
if [ -f node_modules/tailwindcss/lib/cli.js ]; then
  echo "Tailwind CLI found at node_modules/tailwindcss/lib/cli.js"
else
  echo "Tailwind CLI not found in node_modules/tailwindcss/lib/cli.js"
fi
echo ""

echo "14. Showing last 20 lines from the latest NPM log (if exists):"
if [ -d ~/.npm/_logs ]; then
  LATEST_LOG=$(ls -t ~/.npm/_logs | head -n 1)
  echo "Latest log file: $LATEST_LOG"
  tail -n 20 ~/.npm/_logs/$LATEST_LOG
else
  echo "NPM log directory not found."
fi

echo ""
echo "=================== Diagnostics Complete ==================="
