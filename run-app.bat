@echo off
title VitaSage AI — Full App
color 0E
echo.
echo  ==========================================
echo   VitaSage AI - Starting Full Application
echo  ==========================================
echo.
echo  [1/2] Starting FastAPI Backend...
echo        URL:     http://localhost:8000
echo        Swagger: http://localhost:8000/docs
echo.
start "VitaSage Backend" cmd /k "cd /d "%~dp0backend" && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo  Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo  [2/2] Starting React Frontend...
echo        URL:     http://localhost:5173
echo.
start "VitaSage Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo  Waiting 5 seconds for frontend to start...
timeout /t 5 /nobreak > nul

echo.
echo  ==========================================
echo   Both servers are running!
echo.
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:8000
echo   Swagger:   http://localhost:8000/docs
echo.
echo   Demo Login:
echo     Hospital ID : HSP001
echo     Username    : admin
echo     Password    : Admin@123
echo  ==========================================
echo.

echo  Opening browser...
start "" "http://localhost:5173"

echo  Press any key to close this launcher window.
echo  (Backend and Frontend windows will keep running)
pause > nul
