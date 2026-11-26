# GymScore デスクトップ版 Windows ビルドスクリプト
# 使い方: desktop フォルダで  powershell -ExecutionPolicy Bypass -File .\build-win.ps1
#
# Google ドライブ上で node_modules を作ると同期が重くなるため、
# 実際のビルドは %LOCALAPPDATA%\gymscore-desktop-build で行い、
# できあがった exe だけを desktop\dist にコピーします。

$ErrorActionPreference = 'Stop'
$src = $PSScriptRoot
$work = Join-Path $env:LOCALAPPDATA 'gymscore-desktop-build'

Write-Host '1/4 Web版 gymscore.html からオフライン版を生成...'
Push-Location $src
node scripts/prepare.js
if ($LASTEXITCODE -ne 0) { throw 'prepare.js が失敗しました' }
Pop-Location

Write-Host "2/4 ビルド用フォルダへコピー: $work"
New-Item -ItemType Directory -Force $work | Out-Null
foreach ($item in @('app', 'build', 'scripts')) {
  $dst = Join-Path $work $item
  if (Test-Path $dst) { Remove-Item -Recurse -Force $dst }
  Copy-Item -Recurse (Join-Path $src $item) $dst
}
Copy-Item -Force (Join-Path $src 'package.json') $work
Copy-Item -Force (Join-Path $src 'main.js') $work

Write-Host '3/4 依存パッケージのインストールと exe の作成（初回は数分かかります）...'
Push-Location $work
if (Test-Path 'dist') { Remove-Item -Recurse -Force 'dist' }
npm install --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { throw 'npm install が失敗しました' }
npx electron-builder --win
if ($LASTEXITCODE -ne 0) { throw 'electron-builder が失敗しました' }
Pop-Location

Write-Host '4/4 できあがった exe を desktop\dist にコピー...'
$out = Join-Path $src 'dist'
New-Item -ItemType Directory -Force $out | Out-Null
Get-ChildItem (Join-Path $work 'dist') -Filter '*.exe' | Copy-Item -Destination $out -Force
Get-ChildItem $out -Filter '*.exe' | Format-Table Name, @{n='MB'; e={[math]::Round($_.Length / 1MB, 1)}}
Write-Host '完了'
