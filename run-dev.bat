@echo off
setlocal
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"

echo ===================================================================
echo   RenalCare Patient Management System - Kidney_Project_v2 (1 Port)
echo ===================================================================
echo.
echo He thong dang chay tren DUY NHAT 1 CONG:
echo   --^> Web App: http://localhost:3001
echo   --^> API:     http://localhost:3001/api/healthz
echo.
echo Nhan Ctrl+C de dung server khi khong dung nua.
echo ===================================================================

rem Tu dong mo trinh duyet sau 2 giay
start "" cmd /c "ping 127.0.0.1 -n 3 > nul && start http://localhost:3001"

rem Khoi dong Server Express (phuc vu ca Web lan API)
cd /d "%~dp0backend"
node src/app.js

