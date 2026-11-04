@echo off
setlocal
title PatiPanel - Veteriner Klinik Platformu
cd /d "%~dp0"

echo.
echo  ===================================================
echo     PatiPanel - Veteriner Klinik Platformu
echo  ===================================================
echo.

rem ---- 1. Node.js kontrolu ----
where node >nul 2>nul
if errorlevel 1 goto :nonode
for /f "tokens=1 delims=v." %%a in ('node -v') do set NODEMAJOR=%%a
if %NODEMAJOR% LSS 20 goto :oldnode

rem ---- 2. Ayar dosyasi ----
if not exist ".env" copy ".env.example" ".env" >nul

rem ---- 3. Paketler ----
if exist "node_modules\next\package.json" goto :db
echo  [1/3] Paketler kuruluyor. Ilk seferde 1-3 dakika surebilir...
call npm install --no-audit --no-fund
if errorlevel 1 goto :fail

:db
rem ---- 4. Veritabani ve demo veriler ----
echo  [2/3] Veritabani hazirlaniyor...
call npx prisma db push --skip-generate
if errorlevel 1 goto :fail
call npm run seed
if errorlevel 1 goto :fail

rem ---- 5. Sunucu ----
echo.
echo  [3/3] Sunucu baslatiliyor...
echo.
echo   Platform      : http://localhost:3000
echo   Demo klinik   : http://localhost:3000/k/patidostu
echo   Alt alan adi  : http://patidostu.localhost:3000
echo   Klinik paneli : http://localhost:3000/giris
echo.
echo   Klinik girisi : klinik@patidostu.com  /  pati123
echo   Yonetici      : admin@patipanel.local /  admin123
echo.
echo   Kapatmak icin bu pencerede Ctrl+C yapin.
echo.
start "" cmd /c "ping -n 9 127.0.0.1 >nul & start http://localhost:3000"
call npm run dev
goto :eof

:nonode
echo  [HATA] Node.js bulunamadi.
echo  https://nodejs.org adresinden LTS surumunu kurun, sonra bu dosyayi tekrar calistirin.
start "" https://nodejs.org/tr/download
pause
exit /b 1

:oldnode
echo  [HATA] Node.js surumunuz eski: v%NODEMAJOR%. En az 20 gerekli.
echo  https://nodejs.org adresinden LTS surumunu kurun.
start "" https://nodejs.org/tr/download
pause
exit /b 1

:fail
echo.
echo  [HATA] Bir adim basarisiz oldu. Yukaridaki mesaji okuyun.
echo  Internet baglantinizi kontrol edip tekrar deneyin.
pause
exit /b 1
