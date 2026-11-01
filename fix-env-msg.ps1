$ErrorActionPreference = 'Stop'
$path = 'D:\Real State Website\app\api\admin\system\route.ts'
$text = [System.IO.File]::ReadAllText($path)
$old  = 'Hindi maisulat ang .env.local (read-only filesystem?).'
$new  = 'Could not write to .env.local (read-only filesystem?).'

$count = ([regex]::Matches($text, [regex]::Escape($old))).Count
$text  = $text.Replace($old, $new)
[System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding $false))
Write-Output "replaced $count occurrence(s)"