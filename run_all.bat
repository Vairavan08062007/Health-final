@echo off
title AI Cloud Care Setup
echo Starting Backend Server on http://127.0.0.1:8000
start cmd /k "cd /d ""%~dp0backend"" && .\venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000"

echo Starting Frontend Server on http://localhost:3000
start cmd /k "cd /d ""%~dp0frontend"" && npm install && npm run dev"
echo Both servers are starting...
