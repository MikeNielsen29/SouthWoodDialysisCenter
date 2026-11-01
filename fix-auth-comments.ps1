$ErrorActionPreference = 'Stop'
$path = 'D:\Real State Website\app\api\admin\auth\route.ts'

# Copy the marker characters verbatim from elsewhere in the same file so the
# emoji match exactly (a \u escape picked the wrong codepoint).
$lines = [System.IO.File]::ReadAllLines($path)

# line 15 already contains a correct "⛔"; borrow that exact character.
$marker = $lines[14].Substring(0, 1)

$fix = @{
  28 = ' * ' + $marker + '⛔⛔⛔ BUG FIX (2026-09-30) — rate limiting was the ROOT CAUSE of the problem.'
  30 = ' * ' + $marker + ' WHY IT WAS LIKE THIS: `rateLimited(ip)` sat on the **first line** of the'
  39 = ' *    ' + $marker + ' Worse: it is in-memory (`Map`), not persistent — so once the server'
}

foreach ($n in $fix.Keys) { $lines[$n - 1] = $fix[$n] }

[System.IO.File]::WriteAllLines($path, $lines, (New-Object System.Text.UTF8Encoding $false))
Write-Output ("markers fixed: " + $fix.Count)