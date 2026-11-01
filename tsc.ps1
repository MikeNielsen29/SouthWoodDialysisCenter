$ErrorActionPreference = 'Continue'
Set-Location 'C:\Users\Michael P. Rosal\Desktop\Real State Website'
$out = & '.\node_modules\.bin\tsc.cmd' --noEmit --pretty false 2>&1 | Out-String
$out | Set-Content -Path 'C:\Users\Michael P. Rosal\.cline\data\workspaces\chat\tsc.txt' -Encoding UTF8
Write-Output "LEN=$($out.Length)"
