# npm-run-completion.ps1  (PS 5.1+ safe; ASCII punctuation only)

# Find nearest package.json upward from a start directory
function Find-PackageJson {
    param([string]$Start = (Get-Location).Path)
    $dir = Resolve-Path -LiteralPath $Start
    while ($true) {
        $candidate = Join-Path $dir 'package.json'
        if (Test-Path $candidate) { return $candidate }
        $parent = Split-Path -Path $dir -Parent
        if (-not $parent -or $parent -eq $dir) { break }
        $dir = $parent
    }
    return $null
}

# Get scripts from nearest package.json
function Get-NpmScripts {
    $pkg = Find-PackageJson
    if (-not $pkg) { return @() }
    try {
        $json = Get-Content -Raw -LiteralPath $pkg | ConvertFrom-Json -EA Stop
    } catch { return @() }
    if (-not $json.scripts) { return @() }
    $json.scripts.PSObject.Properties | ForEach-Object {
        [pscustomobject]@{
            Name        = $_.Name
            Command     = $_.Value
            PackageJson = $pkg
        }
    }
}

# Register argument completer for npm run / npm run-script
if (Get-Command Register-ArgumentCompleter -ErrorAction Ignore) {

    $scriptBlock = {
        param($commandName, $parameterName, $wordToComplete, $commandAst, $fakeBoundParameters)

        # Only trigger after "run" or "run-script"
        $text = $commandAst.Extent.Text
        if ($text -notmatch '\brun(-script)?\b') { return }

        $scripts = Get-NpmScripts
        if (-not $scripts) { return }

        $filtered = if ($wordToComplete) {
            $scripts | Where-Object { $_.Name -like "$wordToComplete*" }
        } else { $scripts }

        foreach ($s in $filtered) {
            $listItem = "$($s.Name)"
            $toolTip  = "$($s.Name) - $([IO.Path]::GetFileName($s.PackageJson)) :: $($s.Command)"
            [System.Management.Automation.CompletionResult]::new(
                $listItem, $listItem, 'ParameterValue', $toolTip
            )
        }
    }

    $hasNative = $PSVersionTable.PSVersion.Major -ge 6
    $cmds = @('npm','npm.cmd','npm.ps1','npm.exe')

    foreach ($c in $cmds) {
        try {
            if ($hasNative) {
                Register-ArgumentCompleter -Native -CommandName $c -ScriptBlock $scriptBlock
            } else {
                Register-ArgumentCompleter -CommandName $c -ScriptBlock $scriptBlock | Out-Null
            }
        } catch { }
    }
}

# Optional: fuzzy runner (uses fzf if available, otherwise OGV, otherwise Read-Host)
function nr {
    param([string]$Filter)
    $scripts = Get-NpmScripts
    if (-not $scripts) { Write-Host "No scripts found."; return }

    $choices = $scripts | ForEach-Object {
        # "name :: command"
        "{0} :: {1}" -f $_.Name, $_.Command
    }

    $pick = $null
    if (Get-Command fzf -EA Ignore) {
        if ($Filter) { $pick = $choices | fzf -q $Filter }
        else { $pick = $choices | fzf }
    } elseif (Get-Command Out-GridView -EA Ignore) {
        $pick = $choices | Out-GridView -PassThru -Title "npm scripts"
    } else {
        $choices | ForEach-Object { Write-Host $_ }
        $name = Read-Host "Type script name"
        $pick = $choices | Where-Object { $_ -like "$name :: *" } | Select-Object -First 1
    }

    if (-not $pick) { return }
    $scriptName = ($pick -split ' :: ')[0]
    Write-Host "npm run $scriptName" -ForegroundColor Gray
    npm run $scriptName
}


