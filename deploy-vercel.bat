@echo off
echo ========================================
echo  Deploy BachatBro to Vercel
echo ========================================
echo.

echo Step 1: Checking if Vercel CLI is installed...
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Vercel CLI not found. Installing...
    npm install -g vercel
) else (
    echo Vercel CLI found!
)
echo.

echo Step 2: Building project locally to test...
echo.
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo  Build failed! Fix errors before deploying.
    echo ========================================
    pause
    exit /b 1
)
echo.
echo Build successful!
echo.

echo Step 3: Deploying to Vercel...
echo.
echo ========================================
echo  Follow the prompts:
echo  - Set up and deploy? Yes
echo  - Which scope? Your account
echo  - Link to existing project? No (first time)
echo  - Project name? bachatbro
echo  - Directory? ./
echo  - Override settings? No
echo ========================================
echo.

vercel --prod

echo.
echo ========================================
echo  Deployment Complete!
echo.
echo  Next Steps:
echo  1. Copy your Vercel URL
echo  2. Update Google OAuth settings
echo  3. Add your Vercel URL to:
echo     - Authorized JavaScript origins
echo     - Authorized redirect URIs
echo  4. Wait 5 minutes
echo  5. Test your app!
echo ========================================
echo.

pause
