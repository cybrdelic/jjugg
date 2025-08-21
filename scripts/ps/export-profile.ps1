param(
  [string]$DestinationDir = (Join-Path (Resolve-Path "$PSScriptRoot\..\..") 'profiles\PowerShell')
)

$profilePath = $PROFILE
if (-not (Test-Path -LiteralPath $profilePath)) {
  Write-Error "Profile not found: $profilePath"
  exit 1
}

# Ensure destination directory exists
New-Item -ItemType Directory -Force -Path $DestinationDir | Out-Null

$dest = Join-Path $DestinationDir (Split-Path -Leaf $profilePath)
Copy-Item -LiteralPath $profilePath -Destination $dest -Force

Write-Host "Exported profile to: $dest" -ForegroundColor Green
