@echo off
echo ========================================
echo   Finance Dashboard - Starting...
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo.
    echo WARNING: .env file not found!
    echo Please create .env file with your Google Client ID
    echo.
    echo Example:
    echo REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
    echo.
    pause
    exit /b 1
)

echo Starting development server...
echo.
echo The app will open at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm start
