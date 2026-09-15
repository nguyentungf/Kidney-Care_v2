# PowerShell launcher for RenalCare System (Kidney_Project_v2)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$env:Path = "C:\Program Files\nodejs;" + $env:Path
$projectDir = $PSScriptRoot

Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  RenalCare Patient Management System - Kidney_Project_v2" -ForegroundColor Green
Write-Host "===================================================================" -ForegroundColor Cyan

Write-Host "[1/2] Starting Backend API (Port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectDir\backend'; `$env:Path = 'C:\Program Files\nodejs;' + `$env:Path; node src/app.js"

Start-Sleep -Seconds 2

Write-Host "[2/2] Starting Frontend UI (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectDir\frontend'; `$env:Path = 'C:\Program Files\nodejs;' + `$env:Path; npm run dev"

Write-Host "`nBoth services launched!" -ForegroundColor Green
Write-Host "  - Backend:  http://localhost:3001/api/healthz" -ForegroundColor Gray
Write-Host "  - Frontend: http://localhost:5173" -ForegroundColor Gray

Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"

