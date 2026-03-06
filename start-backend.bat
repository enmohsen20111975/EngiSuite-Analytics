@echo off
echo ================================================
echo    EngiSuite Backend Server
echo ================================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    pause
    exit /b 1
)

:: Start the backend server
echo Starting Backend Server on Port 8000...
echo.
echo API Endpoints:
echo   - http://localhost:8000/api/learning/disciplines
echo   - http://localhost:8000/api/workflows/equations
echo   - http://localhost:8000/api/workflows/pipelines
echo   - http://localhost:8000/api/calculators/equations/catalog
echo.

cd /d "%~dp0"
npm run dev:server
