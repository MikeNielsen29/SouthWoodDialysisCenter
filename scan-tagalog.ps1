# Scan for Tagalog left in the UI layer (components/ + app/).
# Usage:  pwsh -File scan-tagalog.ps1 [subfolder] [outfile]
param(
  [string]$Root = 'D:\Real State Website',
  [string]$Sub  = 'components,app',
  [string]$Out  = 'C:\Users\Michael P. Rosal\.cline\data\workspaces\chat\_scan.txt',
  [switch]$UserOnly   # skip lines that look like pure comment lines
)

# Tagalog function words + common UI phrases. \b keeps "something" from matching "ang".
$pattern = 'hindi|kung|kapag|mga |wala\b|walang|dapat|pwede|maaari|nais|pagkatapos|nakatago|maliit|kulang|buksan|ayusin|tingnan|halimbawa|markahan|burahin|hanggang|maraming|nang |kita\b|lamang|pero\b|kaya|paano|bakit|para sa|ito ay|ito \b|iyon|dahil|pero |tulad|maging|ayon'

$roots = $Sub.Split(',') | ForEach-Object { Join-Path $Root $_.Trim() }
$files = foreach ($r in $roots) { Get-ChildItem -Path $r -Recurse -Include *.ts,*.tsx -File -ErrorAction SilentlyContinue }

$hits = $files | Select-String -Pattern $pattern

if ($UserOnly) {
  # Comment lines start with *, //, /*, or {/* — those are for developers,
  # not visitors. End-of-line trailing comments stay in, which is the safe
  # direction (may over-report rather than hide a real string).
  $hits = $hits | Where-Object {
    $t = $_.Line.Trim()
    -not ($t.StartsWith('*') -or $t.StartsWith('//') -or $t.StartsWith('/*') -or $t.StartsWith('{/*'))
  }
}

$lines = @()
$lines += "TOTAL HITS: $($hits.Count)$(if ($UserOnly) { ' (user-visible lines only)' })"
$lines += ""
$lines += "=== BY FILE ==="
$hits | Group-Object Filename | Sort-Object Count -Descending | ForEach-Object {
  $lines += "{0,4}  {1}" -f $_.Count, $_.Name
}
$lines += ""
$lines += "=== DETAIL ==="
$hits | Sort-Object Filename, LineNumber | ForEach-Object {
  $rel = $_.Path.Replace($Root + '\', '')
  $lines += ("{0}:{1} | {2}" -f $rel, $_.LineNumber, $_.Line.Trim())
}

$lines | Set-Content -Path $Out -Encoding UTF8
Write-Output "wrote $($hits.Count) hits to $Out"