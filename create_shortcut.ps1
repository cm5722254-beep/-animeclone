$ws = New-Object -ComObject WScript.Shell
$desktopPath = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopPath "AI Dubbing Studio Khmer.lnk"

$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }

$vbsPath = Join-Path $scriptDir "Launch_Studio_App.vbs"

$s = $ws.CreateShortcut($shortcutPath)
$s.TargetPath = "wscript.exe"
$s.Arguments = "`"$vbsPath`""
$s.WorkingDirectory = $scriptDir
$s.Description = "AI Voice Clone & Dubbing Studio"
$s.Save()

Write-Host "Desktop Shortcut Created Successfully at: $shortcutPath"
