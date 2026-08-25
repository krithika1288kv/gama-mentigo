@echo off
REM Simple Windows reinstall + start
cd /d "%~dp0.."

echo.
echo Make sure you stopped the old server first (Ctrl+C in that window).
echo.

echo [1/5] Clearing bad npm os override (if any)...
call npm config delete os >nul 2>&1

echo [2/5] Removing old install and cache folders...
if exist node_modules rmdir /s /q node_modules
if exist apps\web\node_modules rmdir /s /q apps\web\node_modules
if exist apps\web\.next rmdir /s /q apps\web\.next

echo [3/5] Fresh npm install (this can take a few minutes)...
call npm install
if errorlevel 1 goto fail

echo [4/5] Ensuring local settings file exists...
if not exist apps\web\.env.local copy apps\web\.env.example apps\web\.env.local >nul

echo [5/5] Starting the app (webpack mode — more reliable on Windows)...
call npm run dev
goto end

:fail
echo.
echo Something failed. Copy the red error text above and send it for help.
pause
exit /b 1

:end
