$out = @()
try {
  $r = Invoke-WebRequest -Uri 'http://localhost:3100/faq' -UseBasicParsing -TimeoutSec 60
  $out += 'faq_status=' + $r.StatusCode
  $m = [regex]::Matches($r.Content, 'about \d+ days')
  $out += 'faq_avg_days=' + (($m | ForEach-Object { $_.Value }) -join ' | ')
} catch { $out += 'FAQ_ERROR: ' + $_.Exception.Message }

try {
  $r2 = Invoke-WebRequest -Uri 'http://localhost:3100/' -UseBasicParsing -TimeoutSec 60
  $out += 'home_status=' + $r2.StatusCode
  $out += 'home_has_avgdays_label=' + ($r2.Content -match 'Avg\. days on market')
} catch { $out += 'HOME_ERROR: ' + $_.Exception.Message }

try {
  $r3 = Invoke-WebRequest -Uri 'http://localhost:3100/listings' -UseBasicParsing -TimeoutSec 60
  $out += 'listings_status=' + $r3.StatusCode
} catch { $out += 'LISTINGS_ERROR: ' + $_.Exception.Message }

$out | Set-Content -Path "$env:TEMP\pagecheck.txt" -Encoding UTF8
Write-Output 'done'
