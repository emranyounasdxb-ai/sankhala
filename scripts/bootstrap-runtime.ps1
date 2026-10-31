$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$nodeVersion = (Get-Content -LiteralPath (Join-Path $projectRoot '.node-version') -Raw).Trim()
$npmVersion = '12.2.1'
$runtimeRoot = Join-Path $projectRoot '.runtime'
$archiveName = "node-v$nodeVersion-win-x64.zip"
$nodeDirectory = Join-Path $runtimeRoot "node-v$nodeVersion-win-x64"
$nodeBinary = Join-Path $nodeDirectory 'node.exe'
if (-not [Environment]::Is64BitOperatingSystem) { throw 'This bootstrap targets 64-bit Windows.' }
New-Item -ItemType Directory -Force -Path $runtimeRoot | Out-Null
if (-not (Test-Path -LiteralPath $nodeBinary)) {
    $archivePath = Join-Path $runtimeRoot $archiveName
    $baseUri = "https://nodejs.org/dist/v$nodeVersion"
    $sums = (Invoke-WebRequest -Uri "$baseUri/SHASUMS256.txt").Content
    $sumLine = ($sums -split "`n" | Where-Object { $_.Trim().EndsWith("  $archiveName") })
    if (@($sumLine).Count -ne 1) { throw 'Could not find the official Node archive checksum.' }
    $expected = ($sumLine.Trim() -split '\s+')[0]
    Invoke-WebRequest -Uri "$baseUri/$archiveName" -OutFile $archivePath
    $actual = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash
    if ($actual -ne $expected) { throw 'Node archive checksum verification failed.' }
    Expand-Archive -LiteralPath $archivePath -DestinationPath $runtimeRoot -Force
}
if ((& $nodeBinary --version) -ne "v$nodeVersion") { throw 'Unexpected project Node version.' }
$npmPrefix = Join-Path $runtimeRoot 'npm'
$npmCli = Join-Path $npmPrefix 'node_modules\npm\bin\npm-cli.js'
$oldPath = $env:PATH
try {
    $env:PATH = "$nodeDirectory;$oldPath"
    $installedNpm = if (Test-Path -LiteralPath $npmCli) { & $nodeBinary $npmCli --version } else { '' }
    if ($installedNpm -ne $npmVersion) {
        $bundledCli = Join-Path $nodeDirectory 'node_modules\npm\bin\npm-cli.js'
        & $nodeBinary $bundledCli install --prefix $npmPrefix --no-audit --no-fund --package-lock=false "npm@$npmVersion"
        if ($LASTEXITCODE -ne 0) { throw 'Project npm installation failed.' }
    }
    & $nodeBinary --version
    & $nodeBinary $npmCli --version
} finally { $env:PATH = $oldPath }
Write-Output 'Project runtime ready. Use .\scripts\npm.ps1 for project commands.'
