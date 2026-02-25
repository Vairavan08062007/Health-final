@echo off
title VitaSage AI -- Add User Direct
color 0D
echo.
echo  ==========================================
echo   VitaSage AI - Add Custom User
echo   BEFORE running: open add_user_direct.py
echo   and set DB_PASSWORD to your postgres pw
echo  ==========================================
echo.
cd /d "%~dp0backend"
python add_user_direct.py
echo.
pause
