$root = 'D:\Project\Southwood Dialysis Center website'
Set-Location -LiteralPath $root
$scratch = @('probe.ps1','check_tools.ps1','grep_refs.ps1','make_fav.ps1','run_build.ps1','find_html.ps1','check_fav.ps1','check_fav2.ps1','verify_refs.ps1','dims.ps1')
foreach ($f in $scratch) { if (Test-Path $f) { Remove-Item -LiteralPath $f -Force; Write-Output "removed $f" } }
git rm -- 'public/logo.svg'
git add -A
Write-Output '--- git status ---'
git status --short
git commit -m "feat(branding): use SBDC.png as site logo and add favicon" 2>&1
Write-Output "COMMIT_EXIT=$LASTEXITCODE"
Write-Output '--- pushing ---'
git push 2>&1
Write-Output "PUSH_EXIT=$LASTEXITCODE"
Write-Output '--- recent log ---'
git --no-pager log --oneline -5
