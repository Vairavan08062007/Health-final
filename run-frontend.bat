@echo off
title VitaSage AI — Frontend
color 0B
echo.
echo  ==========================================
echo   VitaSage AI - React Frontend (Vite)
echo   http://localhost:5173
echo  ==========================================
echo.
cd /d "%~dp0frontend"
cmd /c "npm run dev"
pause
