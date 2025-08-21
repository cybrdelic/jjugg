# ============================
# PowerShell Profile — “Lean Max”
# ============================

# Ensure PSReadLine is present
try { Import-Module PSReadLine -ErrorAction SilentlyContinue } catch {}

# ---- Performance & basics ----
$PSStyle.OutputRendering = "ANSI"
Set-PSReadLineOption -PredictionSource HistoryAndPlugin -PredictionViewStyle ListView
Set-PSReadLineOption -BellStyle None
Set-PSReadLineOption -HistorySearchCursorMovesToEnd:$true -HistoryNoDuplicates:$true
Set-PSReadLineOption -HistorySaveStyle SaveIncrementally
# Secret-safe history (filters tokens, passwords, gh keys, etc.)
Set-PSReadLineOption -AddToHistoryHandler {
  param($line)
  $deny = '(password|passwd|pwd|secret|token|apikey|ghp_|bearer)\s*[:=]\s*\S+'
  return -not ($line -match $deny)
}

# Menu-style completion + smart keys
Set-PSReadLineKeyHandler -Key Tab -Function MenuComplete
# Some PSReadLine versions don't have ReverseMenuComplete; fall back to previous-tab behavior
try { Set-PSReadLineKeyHandler -Key "Shift+Tab" -Function TabCompletePrevious } catch { }
Set-PSReadLineKeyHandler -Key "Ctrl+Spacebar" -Function AcceptSuggestion
Set-PSReadLineKeyHandler -Key "Ctrl+RightArrow" -Function AcceptNextSuggestionWord
Set-PSReadLineKeyHandler -Key "Ctrl+Backspace" -Function BackwardKillWord

# ---- NPM run completion (dot-source snippet from repo) ----
try { . (Join-Path $PSScriptRoot 'npm-run-completion.ps1') } catch {}

# ---- Optional: fzf bindings (if fzf.exe exists) ----
$__HasFzf = $null -ne (Get-Command fzf -ErrorAction Ignore)
if ($__HasFzf) {
  function Invoke-HistoryFzf {
    $hist = (Get-Content (Get-PSReadLineOption).HistorySavePath -ErrorAction Ignore) | Select-Object -Last 5000
    $choice = $hist | Sort-Object -Unique | fzf --prompt="history> " --height=40% --reverse --border
    if ($choice) { [Microsoft.PowerShell.PSConsoleReadLine]::Replace(0, $null, $choice) }
  }
  function Invoke-FileFzf {
    $choice = fd -t f -H -E .git 2>$null
    if (-not $choice) { $choice = Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object FullName }
    $p = $choice | fzf --prompt="file> " --height=40% --reverse --border
    if ($p) { [Microsoft.PowerShell.PSConsoleReadLine]::Insert($p) }
  }
  function Invoke-CdFzf {
    $choice = fd -t d -H -E .git 2>$null
    if (-not $choice) { $choice = Get-ChildItem -Directory -Recurse -ErrorAction SilentlyContinue | ForEach-Object FullName }
    $d = $choice | fzf --prompt="cd> " --height=40% --reverse --border
    if ($d) { Set-Location $d }
  }
  Set-PSReadLineKeyHandler -Key "Ctrl+r" -ScriptBlock { Invoke-HistoryFzf }
  Set-PSReadLineKeyHandler -Key "Ctrl+t" -ScriptBlock { Invoke-FileFzf }
  Set-PSReadLineKeyHandler -Key "Alt+c"  -ScriptBlock { Invoke-CdFzf }
}

# ---- Optional: zoxide (frecent cd) ----
if (Get-Command zoxide -ErrorAction Ignore) {
  Invoke-Expression (& { (zoxide init powershell | Out-String) })
}

# ---- Path hygiene ----
function Repair-Path {
  $seen = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
  $new = New-Object System.Collections.Generic.List[string]
  foreach ($p in ($env:Path -split ';')) {
    if ([string]::IsNullOrWhiteSpace($p)) { continue }
    if ($seen.Add($p)) { $new.Add($p) }
  }
  $env:Path = ($new -join ';')
}
Repair-Path

# ---- Safer delete (send to Recycle Bin) ----
function rmrf {
  [CmdletBinding(SupportsShouldProcess)]
  param(
    [Parameter(Mandatory, ValueFromRemainingArguments)]
    [string[]]$Path,
    [switch]$Hard # bypass recycle bin
  )
  $count = $Path.Count
  if ($count -gt 25 -and -not $PSCmdlet.ShouldProcess("$count items", "Delete")) { return }
  if ($Hard) {
    Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction Stop
    return
  }
  Add-Type -AssemblyName Microsoft.VisualBasic
  foreach ($p in $Path) {
    if (Test-Path -LiteralPath $p) {
      if ((Get-Item -LiteralPath $p).PSIsContainer) {
        [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteDirectory($p,'OnlyErrorDialogs','SendToRecycleBin')
      } else {
        [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile($p,'OnlyErrorDialogs','SendToRecycleBin')
      }
    }
  }
}
Set-Alias -Name rm -Value rmrf -Force

# ---- QoL helpers ----
function mkcd { param([Parameter(Mandatory)][string]$Path) New-Item -ItemType Directory -Force -Path $Path | Out-Null; Set-Location $Path }
function which { param([Parameter(Mandatory)][string]$Name) (Get-Command $Name -ErrorAction SilentlyContinue) | Select-Object -Expand Source }
function open { param([string]$Path='.') Start-Process -FilePath $Path }
function la { Get-ChildItem -Force }
Set-Alias -Name ll -Value Get-ChildItem
Set-Alias -Name whereis -Value which -Force
Set-Alias -Name g  -Value git

# Fast JSON (pretty print) + jq-like helper
function jj  { param([Parameter(ValueFromPipeline)]$InputObject) process { $InputObject | ConvertTo-Json -Depth 100 | Out-String | Write-Output } }
function jc  { param([Parameter(Mandatory)][string]$Json,[string]$PathExpr)
  $o = $Json | ConvertFrom-Json -Depth 100
  if ($PathExpr) {
    try { Invoke-Expression ('$o.' + $PathExpr) }
    catch { Write-Error "Path '$PathExpr' not found." }
  } else { $o }
}

# ---- Auto env activation (Python venv / Node version) ----
$script:__envCache = @{}
function Invoke-AutoEnv {
  $root = (Resolve-Path .).Path
  if ($script:__envCache[$root]) { return }
  # Python .venv
  $venv = Join-Path $root ".venv\Scripts\Activate.ps1"
  if (Test-Path $venv -and -not $env:VIRTUAL_ENV) {
    . $venv
  }
  # Node via nvm-windows
  $nvmrc = Join-Path $root ".nvmrc"
  if (Test-Path $nvmrc -and (Get-Command nvm -ErrorAction Ignore)) {
    $ver = (Get-Content $nvmrc -Raw).Trim()
    if ($ver) { nvm use $ver | Out-Null }
  }
  $script:__envCache[$root] = $true
}

# ---- Git awareness (lightweight, cached) ----
$script:__gitCache = [System.Collections.Concurrent.ConcurrentDictionary[string,object]]::new()
function Get-GitInfo {
  try {
    $root = (git rev-parse --show-toplevel 2>$null).Trim()
    if (-not $root) { return $null }
    $head = Join-Path $root '.git\HEAD'
    $key  = "$root|$((Get-Item $head).LastWriteTimeUtc.Ticks)"
    if ($script:__gitCache.ContainsKey($key)) { return $script:__gitCache[$key] }
    # simple + fast
    $branch = (git rev-parse --abbrev-ref HEAD 2>$null).Trim()
    $dirty  = -not [string]::IsNullOrWhiteSpace((git status --porcelain -uno 2>$null))
    $obj = [pscustomobject]@{ Root=$root; Branch=$branch; Dirty=$dirty }
    # purge stale
    foreach ($k in $script:__gitCache.Keys) { if ($k.StartsWith("$root|")) { [void]$script:__gitCache.TryRemove($k, [ref]([object]$null)) } }
    $script:__gitCache[$key] = $obj
    return $obj
  } catch { return $null }
}

# ---- Minimal, informative prompt ----
$global:__sw = [System.Diagnostics.Stopwatch]::StartNew()
$global:__last = [TimeSpan]::Zero

function global:Prompt {
  $global:__last = $global:__sw.Elapsed
  $global:__sw.Restart()

  Invoke-AutoEnv

  $ok = $?
  $code = $LASTEXITCODE
  $cwd  = (Get-Location).Path
  $git  = Get-GitInfo
  $dur  = if ($global:__last.TotalMilliseconds -ge 500) { "{0:N1} ms" -f $global:__last.TotalMilliseconds } else { "" }

  $left = ""
  $left += "${PSStyle.Foreground.BrightBlue}$([System.IO.Path]::GetFileName($cwd))${PSStyle.Reset}"
  if ($git) {
    $branch = if ($git.Branch -and $git.Branch -ne 'HEAD') { $git.Branch } else { 'detached' }
    $dirty  = if ($git.Dirty) { "*" } else { "" }
    $left += " ${PSStyle.Foreground.BrightBlack}[${PSStyle.Foreground.BrightMagenta}$branch$dirty${PSStyle.Foreground.BrightBlack}]${PSStyle.Reset}"
  }
  if ($dur) { $left += " ${PSStyle.Foreground.BrightBlack}$dur${PSStyle.Reset}" }
  if (-not $ok -or ($code -and $code -ne 0)) {
    $left += " ${PSStyle.Foreground.BrightRed}!$code${PSStyle.Reset}"
  }

  # Right-aligned clock
  $w = $Host.UI.RawUI.WindowSize.Width
  $ts = "$(Get-Date -Format HH:mm:ss)"
  $pad = [Math]::Max(1, $w - $left.Length - $ts.Length - 1)
  "$left$([string]::new(' ', $pad))${PSStyle.Foreground.BrightBlack}$ts${PSStyle.Reset}`n${PSStyle.Foreground.BrightGreen}›${PSStyle.Reset} "
}

# ---- Clickable file/URL links in output (OSC 8 helper) ----
function New-ClickablePath {
  param([Parameter(Mandatory)][string]$Path)
  $u = "file://" + ($Path -replace '\\','/')
  "`e]8;;$u`a$Path`e]8;;`a"
}

# ---- VS Code niceties ----
if (-not $env:TERM_PROGRAM) { $env:TERM_PROGRAM = "vscode" }
$env:LESS = "-R"
