# Convert the Tagalog error/label strings that reach the user through the API.
# Explicit exact-string map — no regex guessing, so nothing else can move.
# Run once. Safe to re-run: already-converted files simply do not match.

$ErrorActionPreference = 'Stop'
$root = 'D:\Real State Website'
$api  = Join-Path $root 'app\api'

$map = [ordered]@{
  'Hindi wasto ang request.'                     = 'Invalid request.'
  'Hindi kilalang collection.'                    = 'Unknown collection.'
  'Hindi wasto ang activity.'                    = 'Invalid activity.'
  'Hindi valid ang mga field.'                   = 'Some fields are not valid.'
  'Hindi nahanap ang lead.'                      = 'Lead not found.'
  'Hindi nahanap.'                               = 'Not found.'
  'Hindi valid ang status.'                      = 'Invalid status.'
  'Hindi nakuha namin ang iyong mensahe.'         = 'We have received your message.'
  'Nakuha na namin ang iyong mensahe.'            = 'We have received your message.'
  'May kulang o mali sa form.'                   = 'The form is missing something or has an error.'
  'Kailangan ang iyong pagsang-ayon.'             = 'Your consent is required.'
  'Masyadong maraming tries. Subukan ulit sa loob ng isang minuto.' = 'Too many attempts. Please try again in a minute.'
  'Occupied na ang oras na iyon. Pumili ng iba.' = 'That time is already booked. Please pick another.'
  'Hindi okay ang tugon.'                        = 'The request was not successful.'
  'Hindi JSON ang tugon'                         = 'The response was not JSON'
  'hindi nabuksan ang Web App.'                  = 'the Web App could not be opened.'
}

$changed = 0
Get-ChildItem -Path $api -Recurse -Include *.ts -File | ForEach-Object {
  $path  = $_.FullName
  # [System.IO.File] instead of Get-Content -Raw — works on older PowerShell too.
  $text  = [System.IO.File]::ReadAllText($path)
  $orig  = $text

  foreach ($k in $map.Keys) {
    $text = $text.Replace($k, $map[$k])
  }

  # These embed a runtime value, so handle the templates separately.
  $text = $text.Replace('Hindi kilalang collection: ${collection}', 'Unknown collection: ${collection}')
  $text = $text.Replace('Hindi kilalang legal page: ${slug || "(walang slug)"}', 'Unknown legal page: ${slug || "(no slug)"}')
  $text = $text.Replace('Ang heading ay hindi puwedeng lampas sa ${LIMITS.heading} na karakter.', 'The heading cannot be longer than ${LIMITS.heading} characters.')
  $text = $text.Replace('Ang alt text ay hindi puwedeng lampas sa ${LIMITS.alt} na karakter.', 'The alt text cannot be longer than ${LIMITS.alt} characters.')
  $text = $text.Replace('Ang subheading ay hindi puwedeng lampas sa ${LIMITS.subheading} na karakter.', 'The subheading cannot be longer than ${LIMITS.subheading} characters.')
  $text = $text.Replace('Ang eyebrow ay hindi puwedeng lampas sa ${LIMITS.eyebrow} na karakter.', 'The eyebrow cannot be longer than ${LIMITS.eyebrow} characters.')

  if ($text -ne $orig) {
    [System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding $false))
    Write-Output ("changed: " + $_.Name)
    $changed++
  }
}
Write-Output "files changed: $changed"