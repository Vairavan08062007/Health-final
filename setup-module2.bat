@echo off
title VitaSage AI -- Module 2 Setup
color 0A
echo.
echo  ==========================================
echo   VitaSage AI - Module 2 Setup
echo   Creates tables + doctor + seed patient
echo  ==========================================
echo.
cd /d "%~dp0backend"
python setup_module2.py
echo.
pause
