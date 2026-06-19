@echo off
REM Quick Start Script for PM Health Effects Project (Windows)

echo.
echo ================================
echo PM HEALTH EFFECTS - QUICK START
echo ================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org
    pause
    exit /b 1
)

REM Check if Node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Python version:
python --version
echo Node version:
node --version
echo.

REM Setup Backend
echo [1/4] Setting up backend...
cd backend
python -m venv venv
call venv\Scripts\activate.bat
pip install -q -r requirements.txt
echo ✓ Backend dependencies installed
cd ..

REM Setup Frontend
echo [2/4] Setting up frontend...
cd frontend
call npm install -q
echo ✓ Frontend dependencies installed
cd ..

echo.
echo [3/4] Files ready!
echo [4/4] Starting servers...
echo.

echo Starting backend on http://localhost:8000
start cmd /k "cd backend && venv\Scripts\activate && python main.py"

timeout /t 3

echo Starting frontend on http://localhost:5173
start cmd /k "cd frontend && npm run dev"

echo.
echo ✓ Both servers are starting!
echo ✓ Browser will open automatically
echo ✓ Keep both terminal windows open
echo.
pause
