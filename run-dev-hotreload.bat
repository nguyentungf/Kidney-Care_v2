@echo off
setlocal
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"

echo ===================================================================
echo   RenalCare - Kidney_Project_v2 (Che do Dev 2 Host - Hot Reload)
echo ===================================================================

echo [1/2] Khoi dong Backend API (Port 3001)...
start "RenalCare-Backend-3001" cmd /k "cd /d "%~dp0backend" && node src/app.js"

echo [2/2] Khoi dong Frontend Vite (Port 5173 - Auto Reload)...
start "RenalCare-Frontend-5173" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Da bat 2 host. Dang mo http://localhost:5173 ...
ping 127.0.0.1 -n 4 > nul
start http://localhost:5173

