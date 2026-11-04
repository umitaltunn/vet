@echo off
setlocal
title PatiPanel - Hizli surum
cd /d "%~dp0"
echo.
echo  Uretim surumu hazirlaniyor. Derleme 1-2 dakika surer, sonra sayfalar cok hizli acilir.
echo.
where node >nul 2>nul
if errorlevel 1 goto :nonode
if not exist ".env" copy ".env.example" ".env" >nul
if not exist "node_modules\next\package.json" call npm install --no-audit --no-fund
if errorlevel 1 goto :fail
call npx prisma db push --skip-generate
if errorlevel 1 goto :fail
call npm run seed
call npm run build
if errorlevel 1 goto :fail
echo.
echo   Hazir: http://localhost:3000   Kapatmak icin Ctrl+C
echo.
start "" cmd /c "ping -n 4 127.0.0.1 >nul & start http://localhost:3000"
call npm run start
goto :eof

:nonode
echo  [HATA] Node.js bulunamadi. https://nodejs.org adresinden LTS surumunu kurun.
start "" https://nodejs.org/tr/download
pause
exit /b 1

:fail
echo  [HATA] Bir adim basarisiz oldu. Yukaridaki mesaji okuyun.
pause
exit /b 1
