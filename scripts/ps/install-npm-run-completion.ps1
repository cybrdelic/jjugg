param(
    [switch]$Force
)

# This script ensures the Lean Max profile (which sources the npm-run completion) is dot-sourced from your PowerShell profile.
$leanProfile = Join-Path $PSScriptRoot 'profile-lean-max.ps1'
if (-not (Test-Path -LiteralPath $leanProfile)) {
    Write-Error "Lean profile not found: $leanProfile"
    exit 1
}

$profilePath = $PROFILE
if (-not (Test-Path -LiteralPath (Split-Path -Parent $profilePath))) {
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $profilePath) | Out-Null
}

if (-not (Test-Path -LiteralPath $profilePath)) {
    New-Item -ItemType File -Force -Path $profilePath | Out-Null
}

$importLine = ". '$leanProfile'"
$content = Get-Content -LiteralPath $profilePath -Raw -ErrorAction SilentlyContinue
if ($null -eq $content) { $content = '' }
if ($Force -or -not ($content -is [string] -and $content.Contains($importLine))) {
    Add-Content -LiteralPath $profilePath -Value "`n# Added by jjugg setup (Lean Max profile) - $(Get-Date -Format o)" -Encoding UTF8
    Add-Content -LiteralPath $profilePath -Value $importLine -Encoding UTF8
    Write-Host "Installed Lean Max profile into: $profilePath" -ForegroundColor Green
} else {
    Write-Host "Lean Max profile already referenced: $profilePath" -ForegroundColor Yellow
}

Write-Host "Restart your PowerShell session or run: . \"$profilePath\"" -ForegroundColor Cyan
