@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy-to-github.ps1" %*
set EXITCODE=%ERRORLEVEL%
echo.
if "%EXITCODE%"=="0" (
  echo Deploy terminat cu succes.
) else (
  echo Deploy oprit cu eroare. Verifica deploy-last.log.
)
echo.
pause
exit /b %EXITCODE%
