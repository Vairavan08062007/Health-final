@echo off
title VitaSage AI -- Module 3 Setup
color 0A
echo.
echo  ==========================================
echo   VitaSage AI - Module 3 Setup
echo   Creates patient_vitals table + staff user
echo  ==========================================
echo.
cd /d "%~dp0backend"
python setup_module3.py
echo.
pause
