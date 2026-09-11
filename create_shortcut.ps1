$ws = New-Object -ComObject WScript.Shell
$desktopPath = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopPath "Cheatz Dabber.PRO.lnk"

$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }

$exePath = Join-Path $scriptDir "Cheatz_Dabber_PRO.exe"

$s = $ws.CreateShortcut($shortcutPath)
$s.TargetPath = $exePath
$s.WorkingDirectory = $scriptDir
$s.Description = "Cheatz Dabber.PRO - AI Voice Clone & Movie Dubbing Studio"
$s.IconLocation = "$exePath,0"
$s.Save()

Write-Host "Desktop Shortcut Created Successfully pointing to $exePath"
