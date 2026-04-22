# BOOK-KARO Startup Script
# Run this to start both backend and frontend

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   BOOK-KARO STARTUP" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# Stop any running Java processes first
Write-Host "Stopping any running backend instances..." -ForegroundColor Yellow
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Always rebuild to ensure latest code
Write-Host "Building latest backend (v1.0.4)..." -ForegroundColor Yellow
Set-Location D:\Springboard\backend
mvn clean package -DskipTests

if (-not (Test-Path "D:\Springboard\backend\target\bookkaro-backend-1.0.4.jar")) {
    Write-Host "ERROR: Backend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "[1/2] Starting Backend..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", @"
    Set-Location D:\Springboard\backend
    Write-Host 'BACKEND SERVER - v1.0.4' -ForegroundColor Green
    Write-Host 'Port: 8080' -ForegroundColor Cyan
    Write-Host 'Keep this terminal open' -ForegroundColor Yellow
    java -jar target/bookkaro-backend-1.0.4.jar
"@

Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "[2/2] Starting Frontend..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", @"
    Set-Location D:\Springboard\frontend
    Write-Host 'FRONTEND SERVER - React App' -ForegroundColor Green
    Write-Host 'Port: 3000' -ForegroundColor Cyan
    Write-Host 'Keep this terminal open' -ForegroundColor Yellow
    npm start
"@

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "STARTUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Backend:  http://localhost:8080/api/v1" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "`nTest Credentials:" -ForegroundColor Yellow
Write-Host "  Admin: admin@bookkaro.com / Admin@123" -ForegroundColor White
Write-Host "  Vendor: vendor_mumbai@bookkaro.com / Vendor@123" -ForegroundColor White
Write-Host "  User: user_mumbai_1@bookkaro.com / User@123" -ForegroundColor White
Write-Host "`n========================================`n" -ForegroundColor Cyan
