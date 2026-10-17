@echo off
title Orbit AI Desktop Agent — Launcher
color 0B
echo.
echo  ============================================================
echo   Orbit Personal AI Desktop Agent  v2.0
echo  ============================================================
echo.

:: Check Python
py --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Python not found. Install Python 3.10+ from python.org
    pause
    exit /b 1
)

cd /d "C:\New folder\Fit_Tracker\Fit_Tracker"

:: Install dependencies
echo  Installing Python dependencies...
py -m pip install -r requirements.txt --quiet

:: Check .env
if not exist .env (
    echo  [WARNING] .env file not found. Copying from .env.example...
    copy .env.example .env
    echo  Edit .env and add your API keys, then restart.
    notepad .env
    pause
    exit /b 1
)

echo.
echo  Starting Orbit backend on http://127.0.0.1:8000
echo  Open browser to: http://127.0.0.1:8000
echo.
echo  Press Ctrl+C to stop.
echo.

py server.py

pause
