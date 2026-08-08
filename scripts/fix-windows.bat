@echo off
REM One-click Windows repair for missing Tailwind native packages
cd /d "%~dp0.."

echo.
echo Stopping is manual: press Ctrl+C in the npm run dev window first.
echo.

echo [1/6] Clearing bad npm os override (if any)...
call npm config delete os >nul 2>&1

echo [2/6] Removing old install folders and lockfile...
if exist package-lock.json del /f /q package-lock.json
if exist node_modules rmdir /s /q node_modules
if exist apps\web\node_modules rmdir /s /q apps\web\node_modules
if exist apps\web\.next rmdir /s /q apps\web\.next

echo [3/6] Fresh npm install (this can take a few minutes)...
call npm install
if errorlevel 1 goto fail

echo [4/6] Installing Windows Tailwind helpers...
call npm install @tailwindcss/oxide-win32-x64-msvc@4.3.3 lightningcss-win32-x64-msvc@1.32.0 --workspace=web
if errorlevel 1 goto fail

echo [5/6] Ensuring local settings file exists...
if not exist apps\web\.env.local copy apps\web\.env.example apps\web\.env.local >nul

echo [6/6] Starting the app...
call npm run dev
goto end

:fail
echo.
echo Something failed. Copy the red error text above and send it for help.
pause
exit /b 1

:end
