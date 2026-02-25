@echo off
title VitaSage AI — Backend
color 0A
echo.
echo  ==========================================
echo   VitaSage AI - FastAPI Backend
echo   http://localhost:8000
echo   Swagger: http://localhost:8000/docs
echo  ==========================================
echo.
cd /d "%~dp0backend"
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pause
