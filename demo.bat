@echo off
setlocal enabledelayedexpansion

echo ==============================================================================
echo       AEGISHEALTH AI - INTELLIGENT HEALTHCARE DECISION SUPPORT PLATFORM
echo       B.Tech CSE Artificial Intelligence Course - Dr. Mohd. Nazim
echo       NIET Greater Noida  |  United Nations SDG 3: Good Health and Well-Being
echo ==============================================================================
echo.

cd /d "%~dp0"

echo [1/4] Verifying Python & Node.js environments...
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python is not installed or not in PATH. Please install Python 3.10+.
    pause
    exit /b 1
)

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH. Please install Node.js 18+.
    pause
    exit /b 1
)

echo [2/4] Initializing Database & Executing Critical Path E2E Verifications...
python backend\test_e2e_critical_paths.py
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Some verification tests warned, continuing startup...
)

echo.
echo [3/4] Launching FastAPI Backend Server on port 8000...
start "AegisHealth AI - Backend Service (Port 8000)" cmd /k "cd /d %~dp0backend && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [4/4] Launching React Vite Frontend Application on port 5173...
start "AegisHealth AI - Frontend Client (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ==============================================================================
echo   AegisHealth AI is running!
echo.
echo   Frontend Application:  http://localhost:5173
echo   FastAPI Swagger Docs:  http://localhost:8000/docs
echo   FastAPI Redoc:         http://localhost:8000/redoc
echo.
echo   Pre-Configured Demo Accounts:
echo     - Doctor:  dr.nazim@niet.ac.in   / Doctor@123
echo     - Admin:   admin@niet.ac.in      / Admin@123
echo     - Staff:   nurse.priya@niet.ac.in / Staff@123
echo ==============================================================================
echo.
echo Opening browser in 3 seconds...
timeout /t 3 >nul
start http://localhost:5173

pause

