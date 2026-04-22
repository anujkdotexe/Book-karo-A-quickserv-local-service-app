# =====================================================
# Fix Database Sequences
# =====================================================
# This script fixes sequence issues that cause duplicate key violations

Write-Host "===== FIXING DATABASE SEQUENCES =====" -ForegroundColor Cyan
Write-Host ""

# Database connection details
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "bookkarodb"
$DB_USER = "postgres"

# Prompt for password
Write-Host "Enter PostgreSQL password for user '$DB_USER':" -ForegroundColor Yellow
$DB_PASSWORD = Read-Host -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD)
$PlainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""
Write-Host "Connecting to database '$DB_NAME'..." -ForegroundColor Yellow

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $PlainPassword

try {
    # Run the SQL script
    $scriptPath = Join-Path $PSScriptRoot "fix_all_sequences.sql"
    
    Write-Host "Executing sequence fix script..." -ForegroundColor Yellow
    
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $scriptPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Database sequences fixed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now:" -ForegroundColor Cyan
        Write-Host "  1. Add items to cart" -ForegroundColor White
        Write-Host "  2. Create new bookings" -ForegroundColor White
        Write-Host "  3. Insert new records without errors" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "✗ Error fixing sequences. Please check the output above." -ForegroundColor Red
        Write-Host ""
    }
} catch {
    Write-Host ""
    Write-Host "✗ Error: $_" -ForegroundColor Red
    Write-Host ""
} finally {
    # Clear password from environment
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
