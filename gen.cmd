@echo off
cd /d "C:\Users\Michael P. Rosal\Desktop\Real State Website"
"C:\Program Files\nodejs\node.exe" scripts\generate-listings.mjs > "C:\Users\Michael P. Rosal\.cline\data\workspaces\chat\gen.txt" 2>&1
echo EXITCODE=%ERRORLEVEL% >> "C:\Users\Michael P. Rosal\.cline\data\workspaces\chat\gen.txt"
