# Setup System Settings Table and Data
# Run this script to create the system_settings table and insert default data

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "System Settings Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Database configuration
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "bookkaro"
$DB_USER = "postgres"

Write-Host "Database Configuration:" -ForegroundColor Yellow
Write-Host "  Host: $DB_HOST" -ForegroundColor Gray
Write-Host "  Port: $DB_PORT" -ForegroundColor Gray
Write-Host "  Database: $DB_NAME" -ForegroundColor Gray
Write-Host "  User: $DB_USER" -ForegroundColor Gray
Write-Host ""

# Prompt for password
$DB_PASSWORD = Read-Host "Enter PostgreSQL password for user '$DB_USER'" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD)
$PlainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""
Write-Host "Step 1: Creating system_settings table..." -ForegroundColor Yellow

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $PlainPassword

# Execute SQL script
$sqlFile = "D:\Springboard\scripts\database\create_system_settings_table.sql"

try {
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $sqlFile 2>&1 | Out-String | Write-Host
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Table created successfully!" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to create table" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Error executing SQL: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Verifying data insertion..." -ForegroundColor Yellow

# Query to check inserted data
$querySQL = "SELECT setting_key, setting_value, category FROM system_settings ORDER BY category, setting_key;"

$result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $querySQL 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Data verified successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Current Settings:" -ForegroundColor Cyan
    Write-Host $result
} else {
    Write-Host "✗ Failed to verify data" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 3: Creating CSV backup..." -ForegroundColor Yellow

# Export to CSV
$csvFile = "D:\Springboard\csv files\system_settings.csv"
$exportSQL = "COPY system_settings TO STDOUT WITH CSV HEADER;"

try {
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $exportSQL | Out-File -FilePath $csvFile -Encoding UTF8
    
    if (Test-Path $csvFile) {
        Write-Host "✓ CSV backup created: $csvFile" -ForegroundColor Green
        
        # Also create a backup copy
        $backupFile = "D:\Springboard\csv_backup\system_settings.csv"
        Copy-Item -Path $csvFile -Destination $backupFile -Force
        Write-Host "✓ Backup copy created: $backupFile" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to create CSV file" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error creating CSV: $_" -ForegroundColor Red
}

# Clear password from environment
$env:PGPASSWORD = $null

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Restart your backend server" -ForegroundColor Gray
Write-Host "2. Login as Admin in the frontend" -ForegroundColor Gray
Write-Host "3. Navigate to Content Management -> Functionality Management" -ForegroundColor Gray
Write-Host "4. Update settings as needed" -ForegroundColor Gray
Write-Host ""
