$c = (Invoke-WebRequest 'http://localhost:3100/' -UseBasicParsing -TimeoutSec 30).Content
$out = @()
$out += 'has_avg_label=' + ($c -match '(?i)avg\.?\s*days')
$out += 'has_average_label=' + ($c -match '(?i)average days')
$out += 'has_38=' + ($c -match '38')
$strip = [regex]::Matches($c, '(?i)<h3[^>]*>.{0,80}?days.{0,80}?</h3>')
foreach ($m in [regex]::Matches($c, '(?i).{50}days.{50}')) { $out += 'CTX: ' + $m.Value }
$out | Set-Content 'C:\Users\MICHAE~1.ROS\AppData\Local\Temp\home2.txt' -Encoding UTF8
Write-Output 'done'
