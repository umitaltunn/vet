@echo off
setlocal
title PatiPanel - Demo verileri sifirla
cd /d "%~dp0"
echo.
echo  DIKKAT: Tum veriler silinip demo veriler yeniden yuklenecek.
echo  Eklediginiz klinikler, hastalar ve randevular kaybolur.
echo.
set /p ONAY= Devam etmek icin E yazip Enter'a basin: 
if /i not "%ONAY%"=="E" goto :iptal
if not exist ".env" copy ".env.example" ".env" >nul
call npx prisma db push --force-reset --skip-generate
if errorlevel 1 goto :fail
call npm run seed
echo.
echo  Demo veriler yeniden yuklendi. Simdi baslat.bat ile acabilirsiniz.
pause
goto :eof

:iptal
echo  Iptal edildi, hicbir sey silinmedi.
pause
goto :eof

:fail
echo  [HATA] Sifirlama basarisiz oldu.
pause
exit /b 1
