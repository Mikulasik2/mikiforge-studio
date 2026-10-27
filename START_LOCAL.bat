@echo off
chcp 65001 >nul
title MikiForge Studio - lokalny nahlad
cd /d "%~dp0"

set "PY="
where py >nul 2>nul && set "PY=py -3"
if not defined PY (
  where python >nul 2>nul && (
    python --version >nul 2>nul && set "PY=python"
  )
)

if not defined PY (
  echo.
  echo  Python nie je nainstalovany alebo nie je v PATH.
  echo.
  echo  Moznosti:
  echo   1^) Nainstalujte Python z https://www.python.org/downloads/
  echo      a pri instalacii zaskrtnite "Add python.exe to PATH".
  echo   2^) Alebo jednoducho otvorte subor index.html dvojklikom -
  echo      web funguje aj bez servera.
  echo.
  pause
  exit /b 1
)

echo.
echo  MikiForge Studio v0.1 - lokalny server
echo  Adresa:   http://localhost:8000
echo  Zastavenie: zavrite toto okno alebo stlacte Ctrl+C
echo.
start "" "http://localhost:8000/"
%PY% -m http.server 8000 --bind 127.0.0.1
if errorlevel 1 (
  echo.
  echo  Server sa nepodarilo spustit. Port 8000 je mozno obsadeny -
  echo  zavrite ine okno so serverom a skuste znova.
  pause
)
