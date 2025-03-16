#!/bin/bash
set -e

echo "================ Tailwind CSS Reinstallation & Diagnostics ================"

# Remove node_modules and lock file to start clean
echo "Removing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

# Clean npm cache
echo "Cleaning npm cache..."
npm cache clean --force

# Reinstall all packages from package.json
echo "Running npm install..."
npm install

# Force reinstall Tailwind CSS (as dev dependency)
echo "Reinstalling Tailwind CSS..."
npm install -D tailwindcss@4.0.14

# Check that package.json has the correct entry
echo "Checking package.json for tailwindcss entry:"
grep -i tailwindcss package.json || echo "No tailwindcss entry found in package.json"

# Check if tailwindcss is installed in node_modules
if [ -d node_modules/tailwindcss ]; then
  echo "Tailwind CSS is installed at: node_modules/tailwindcss"
else
  echo "Tailwind CSS is NOT installed in node_modules!"
fi

# List the contents of node_modules/.bin to see if a tailwind binary exists
echo "Listing node_modules/.bin contents (filtering for 'tailwind'):"
ls -la node_modules/.bin | grep -i tailwind || echo "No tailwind binary found in node_modules/.bin"

# Attempt to run the tailwind CLI directly via node, if it exists
if [ -f node_modules/tailwindcss/lib/cli.js ]; then
  echo "Tailwind CLI found. Running version check directly:"
  node node_modules/tailwindcss/lib/cli.js -v || echo "Failed to run tailwind CLI."
else
  echo "Tailwind CLI file not found at node_modules/tailwindcss/lib/cli.js"
fi

echo "================ Diagnostics Complete ================="
