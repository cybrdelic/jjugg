#!/bin/bash

# Ensure the components/sections directory exists
mkdir -p components/sections

# Loop through each component name
for component in DashboardHome Applications Reminders Interviews ProfileArtifacts Goals Timeline; do
  # Convert camelCase to space-separated words (e.g., ProfileArtifacts -> Profile Artifacts)
  display_name=$(echo $component | sed 's/\([A-Z]\)/ \1/g' | sed 's/^ //')
  
  # Set the display text: "Dashboard Home" for DashboardHome, otherwise append " Section"
  if [ "$component" = "DashboardHome" ]; then
    display_text="$display_name"
  else
    display_text="$display_name Section"
  fi
  
  # Create the component file with the appropriate content
  cat > components/sections/$component.js <<EOF
// components/sections/$component.js
export default function $component() {
  return <div>$display_text</div>;
}
EOF
done
