@echo off
echo ================================================
echo    EngiSuite - Starting Server
echo ================================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo Starting EngiSuite Server on Port 8000...
echo.
echo The server serves both:
echo   - Frontend: http://localhost:8000/
echo   - API:      http://localhost:8000/api/
echo.

cd /d "%~dp0"
npm run dev:server
