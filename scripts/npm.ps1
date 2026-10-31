param([Parameter(ValueFromRemainingArguments = $true)][string[]]$CommandArgs)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$nodeVersion = (Get-Content -LiteralPath (Join-Path $projectRoot '.node-version') -Raw).Trim()
$nodeDirectory = Join-Path $projectRoot ".runtime\node-v$nodeVersion-win-x64"
$nodeBinary = Join-Path $nodeDirectory 'node.exe'
$npmDirectory = Join-Path $projectRoot '.runtime\npm\node_modules\npm'
$npmCli = Join-Path $npmDirectory 'bin\npm-cli.js'
if (-not (Test-Path -LiteralPath $nodeBinary) -or -not (Test-Path -LiteralPath $npmCli)) {
    throw 'Run .\scripts\bootstrap-runtime.ps1 first.'
}
$oldPath = $env:PATH
$commandExitCode = 0
Push-Location $projectRoot
try {
    $env:PATH = "$npmDirectory\bin;$nodeDirectory;$oldPath"
    & $nodeBinary $npmCli @CommandArgs
    $commandExitCode = $LASTEXITCODE
} finally {
    $env:PATH = $oldPath
    Pop-Location
}
exit $commandExitCode
