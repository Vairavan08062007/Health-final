@echo off
title VitaSage AI — Seed Database
color 0D
echo.
echo  ==========================================
echo   VitaSage AI - Database Seeder
echo   Creates tables + seeds demo users
echo  ==========================================
echo.
cd /d "%~dp0backend"
python seed_db.py
echo.
pause
