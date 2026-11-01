@echo off
cd /d "C:\Users\Michael P. Rosal\Desktop\Real State Website"
start "" http://localhost:3000/listings
call node_modules\.bin\next.cmd dev -p 3000
