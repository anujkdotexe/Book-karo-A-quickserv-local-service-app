# ============================================================================
# ULTIMATE DATABASE LOADER - Loads all CSV data into PostgreSQL
# Handles column name mapping and transformations
# ============================================================================
# Configuration: Set to $true to truncate all tables before loading
$TRUNCATE_BEFORE_LOAD = $true

$ErrorActionPreference = "Continue"
$dbHost = if ($env:PGHOST) { $env:PGHOST } else { "localhost" }
$dbPort = if ($env:PGPORT) { $env:PGPORT } else { "5432" }
$db = if ($env:PGDATABASE) { $env:PGDATABASE } else { "bookkarodb" }
$user = if ($env:PGUSER) { $env:PGUSER } else { "postgres" }
$env:PGPASSWORD = if ($env:PGPASSWORD) { $env:PGPASSWORD } else { "root" }
$psql = if (Test-Path "C:\Program Files\PostgreSQL\15\bin\psql.exe") { "C:\Program Files\PostgreSQL\15\bin\psql.exe" } else { "psql" }
$csvPath = if ($env:CSV_PATH) { $env:CSV_PATH } else { "d:\Springboard\csv files" }
$tempDir = "$csvPath\temp"

# Create temp directory for transformed CSVs
if (-not (Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
}

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   BOOKARO DATABASE LOADER v3.1         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n[CONFIG] Target database connection" -ForegroundColor Yellow
Write-Host "  Host: $dbHost" -ForegroundColor Gray
Write-Host "  Port: $dbPort" -ForegroundColor Gray
Write-Host "  Database: $db" -ForegroundColor Gray
Write-Host "  User: $user" -ForegroundColor Gray
Write-Host "  CSV Path: $csvPath" -ForegroundColor Gray

# Validate DB connectivity early
$connectionCheck = & $psql -h $dbHost -p $dbPort -U $user -d $db -t -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n✗ ERROR: Unable to connect to PostgreSQL target database." -ForegroundColor Red
    Write-Host "  Check PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD environment variables." -ForegroundColor DarkYellow
    Write-Host "  Details: $connectionCheck" -ForegroundColor DarkRed
    exit 1
}
Write-Host "  ✓ Database connection successful" -ForegroundColor Green

# Validate CSV directory exists
if (-not (Test-Path $csvPath)) {
    Write-Host "`n✗ ERROR: CSV directory not found: $csvPath" -ForegroundColor Red
    exit 1
}

# List available CSVs
Write-Host "`n[PRE-CHECK] Validating CSV files..." -ForegroundColor Yellow
$requiredCSVs = @(
    "users.csv", "categories.csv", "faqs.csv", "coupons.csv",
    "announcements.csv", "banners.csv", "addresses.csv", "wallets.csv",
    "user_preferences.csv", "user_roles.csv", "vendors.csv",
    "vendor_availabilities.csv", "services.csv", "favorites.csv",
    "cart_items.csv", "bookings.csv", "reviews.csv", "payments.csv",
    "refunds.csv", "coupon_usages.csv", "audit_logs.csv"
)

$missingCSVs = @()
foreach ($csv in $requiredCSVs) {
    $path = Join-Path $csvPath $csv
    if (-not (Test-Path $path)) {
        $missingCSVs += $csv
        Write-Host "  ⊘ Missing: $csv" -ForegroundColor DarkYellow
    } else {
        Write-Host "  ✓ Found: $csv" -ForegroundColor DarkGreen
    }
}

if ($missingCSVs.Count -gt 0) {
    Write-Host "`n⚠ WARNING: $($missingCSVs.Count) CSV file(s) missing. Will skip loading these tables." -ForegroundColor Yellow
    Write-Host "  Missing files: $($missingCSVs -join ', ')" -ForegroundColor DarkYellow
} else {
    Write-Host "`n✓ All 21 CSV files found!" -ForegroundColor Green
}

# STEP 1: TRUNCATE (if enabled)
if ($TRUNCATE_BEFORE_LOAD) {
    Write-Host "`n[STEP 1] Truncating all tables..." -ForegroundColor Yellow
    $truncateSQL = @"
TRUNCATE TABLE 
    audit_logs, coupon_usages, refunds, payments, reviews, bookings, 
    favorites, cart_items, vendor_availabilities, user_preferences, user_roles, 
    wallets, addresses, banners, announcements, coupons, 
    services, vendors, categories, faqs, users
RESTART IDENTITY CASCADE;
"@
    & $psql -h $dbHost -p $dbPort -U $user -d $db -c $truncateSQL 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ All tables truncated" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Truncate failed" -ForegroundColor Red
        exit 1
    }
}

# STEP 2: LOAD DATA
Write-Host "`n[STEP 2] Loading CSV data..." -ForegroundColor Yellow
$success = 0
$failed = 0

function Import-TableData {
    param($tableName, $csvFile, $columns)
    
    $fullPath = Join-Path $csvPath $csvFile
    if (-not (Test-Path $fullPath)) {
        Write-Host "  ⊘ $tableName - CSV not found: $csvFile" -ForegroundColor DarkGray
        $script:failed++
        return
    }
    
    # Build the COPY command (explicit UTF8 encoding and NULL '')
    $copyCmd = "\copy $tableName($columns) FROM '$fullPath' WITH (FORMAT csv, HEADER true, DELIMITER ',', ENCODING 'UTF8', NULL '');"
    
    # Execute
    $output = & $psql -h $dbHost -p $dbPort -U $user -d $db -c $copyCmd 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        # Get row count
        $countSQL = "SELECT COUNT(*) FROM $tableName;"
        $count = & $psql -h $dbHost -p $dbPort -U $user -d $db -t -c $countSQL 2>&1
        $count = $count.Trim()
        Write-Host "  ✓ $tableName" -NoNewline -ForegroundColor Green
        Write-Host " ($count rows)" -ForegroundColor Gray
        $script:success++
    } else {
        Write-Host "  ✗ $tableName - " -NoNewline -ForegroundColor Red
        # Extract actual error message
        $errorMsg = $output | Select-String "ERROR:" | Select-Object -First 1
        if ($errorMsg) {
            Write-Host "$errorMsg" -ForegroundColor DarkRed
        } else {
            Write-Host "Failed" -ForegroundColor DarkRed
        }
        $script:failed++
    }
}

# ============================================================================
# LOAD TABLES IN DEPENDENCY ORDER
# ============================================================================

Write-Host "`n  Core Tables:" -ForegroundColor Cyan

# Hash shared seed passwords before loading users so production imports work with bcrypt authentication
if (Test-Path (Join-Path $csvPath "users.csv")) {
    $usersCsv = Join-Path $csvPath "users.csv"
    $usersData = Import-Csv $usersCsv
    $hashedUsers = $usersData | ForEach-Object {
        $_.password = '$2b$10$djZkA688oqpxrBgzmxtomOoAWNtdGyHNpaKP5TkFgmSY6glqMuuuW'
        $_
    }
    $tempUsers = Join-Path $tempDir "users_temp.csv"
    $hashedUsers | Export-Csv $tempUsers -NoTypeInformation -Force
    Import-TableData "users" "temp\users_temp.csv" "id,email,password,full_name,phone,address,city,state,postal_code,latitude,longitude,role,profile_picture,is_active,reset_token,reset_token_expiry,created_at,created_by,updated_at,updated_by,deleted_at"
} else {
    Write-Host "  ⊘ users - CSV not found" -ForegroundColor DarkGray
    $failed++
}

Import-TableData "categories" "categories.csv" "id,name,slug,parent_id,description,is_active,created_at,created_by,updated_at,updated_by,deleted_at"

Import-TableData "faqs" "faqs.csv" "id,question,answer,category,display_order,is_active,created_at,updated_at"

Import-TableData "coupons" "coupons.csv" "id,code,description,discount_type,discount_value,min_order_value,max_discount_amount,starts_at,ends_at,usage_limit,per_user_limit,is_active,created_at,created_by,updated_at,updated_by"

Write-Host "`n  Announcement Tables:" -ForegroundColor Cyan

# Transform announcements CSV - now includes priority
$announcementsCsv = Join-Path $csvPath "announcements.csv"
if (Test-Path $announcementsCsv) {
    Write-Host "  Transforming announcements..." -ForegroundColor DarkGray
    $data = Import-Csv $announcementsCsv
    $transformed = $data | Select-Object id, title, content, 
        @{N='announcement_type';E={$_.type}}, 
        priority, is_active, 
        @{N='starts_at';E={$_.start_date}}, 
        @{N='ends_at';E={$_.end_date}}, 
        created_by, created_at, updated_at
    $tempAnnouncements = Join-Path $tempDir "announcements_temp.csv"
    $transformed | Export-Csv $tempAnnouncements -NoTypeInformation -Force
    Import-TableData "announcements" "temp\announcements_temp.csv" "id,title,content,announcement_type,priority,is_active,starts_at,ends_at,created_by,created_at,updated_at"
} else {
    Write-Host "  ⊘ announcements - CSV not found" -ForegroundColor DarkGray
    $failed++
}

# Transform banners CSV
$bannersCsv = Join-Path $csvPath "banners.csv"
if (Test-Path $bannersCsv) {
    Write-Host "  Transforming banners..." -ForegroundColor DarkGray
    $data = Import-Csv $bannersCsv
    $transformed = $data | Select-Object id, title, image_url, link_url, 
        @{N='target';E={$_.position}}, 
        display_order, is_active, 
        @{N='starts_at';E={$_.start_date}}, 
        @{N='ends_at';E={$_.end_date}}, 
        created_at, updated_at
    $tempBanners = Join-Path $tempDir "banners_temp.csv"
    $transformed | Export-Csv $tempBanners -NoTypeInformation -Force
    Import-TableData "banners" "temp\banners_temp.csv" "id,title,image_url,link_url,target,display_order,is_active,starts_at,ends_at,created_at,updated_at"
} else {
    Write-Host "  ⊘ banners - CSV not found" -ForegroundColor DarkGray
    $failed++
}

Write-Host "`n  User-Related Tables:" -ForegroundColor Cyan

# addresses - now includes is_active and deleted_at
$addressesCsv = Join-Path $csvPath "addresses.csv"
if (Test-Path $addressesCsv) {
    Import-TableData "addresses" "addresses.csv" "id,user_id,address_line1,address_line2,landmark,city,state,postal_code,address_type,is_default,latitude,longitude,is_active,created_at,updated_at,deleted_at"
} else {
    Write-Host "  ⊘ addresses - CSV not found" -ForegroundColor DarkGray
    $failed++
}

# wallets - now includes all columns
$walletsCsv = Join-Path $csvPath "wallets.csv"
if (Test-Path $walletsCsv) {
    Import-TableData "wallets" "wallets.csv" "id,user_id,balance,daily_topup_total,last_topup_date,is_active,created_at,updated_at"
} else {
    Write-Host "  ⊘ wallets - CSV not found" -ForegroundColor DarkGray
    $failed++
}

# user_preferences - now includes all columns
$prefsCsv = Join-Path $csvPath "user_preferences.csv"
if (Test-Path $prefsCsv) {
    Import-TableData "user_preferences" "user_preferences.csv" "id,user_id,email_notifications,sms_notifications,push_notifications,promotional_emails,booking_reminders,created_at,updated_at"
} else {
    Write-Host "  ⊘ user_preferences - CSV not found" -ForegroundColor DarkGray
    $failed++
}

# user_roles - rename column
$rolesCsv = Join-Path $csvPath "user_roles.csv"
if (Test-Path $rolesCsv) {
    Write-Host "  Transforming user_roles..." -ForegroundColor DarkGray
    $data = Import-Csv $rolesCsv
    $transformed = $data | Select-Object user_id, @{N='role_name';E={$_.role}}
    $tempRoles = Join-Path $tempDir "user_roles_temp.csv"
    $transformed | Export-Csv $tempRoles -NoTypeInformation -Force
    Import-TableData "user_roles" "temp\user_roles_temp.csv" "user_id,role_name"
} else {
    Write-Host "  ⊘ user_roles - CSV not found" -ForegroundColor DarkGray
    $failed++
}

Write-Host "`n  Vendor Tables:" -ForegroundColor Cyan

# Transform vendors - handle empty fields and map category_id to valid values
# Valid category IDs: 1, 2, 3, 4, 5, 6, 20
$vendorsCsv = Join-Path $csvPath "vendors.csv"
if (Test-Path $vendorsCsv) {
    Write-Host "  Transforming vendors..." -ForegroundColor DarkGray
    $data = Import-Csv $vendorsCsv
    $transformed = $data | Select-Object id, user_id, business_name, vendor_code, primary_category,
        @{N='category_id';E={
            $catId = [int]$_.category_id
            # Map invalid category IDs to valid ones (1-6, 20)
            if ($catId -in @(1,2,3,4,5,6,20)) { $catId }
            elseif ($catId -ge 7 -and $catId -le 12) { 1 }  # Map 7-12 to Home Services
            elseif ($catId -ge 13 -and $catId -le 17) { 6 } # Map 13-17 to Beauty & Wellness
            else { 20 }  # Map rest to Appliance Repair
        }},
        description, contact_person, email, phone, address, city, state, postal_code, location, latitude, longitude,
        @{N='years_of_experience';E={if ($_.years_of_experience -and $_.years_of_experience.Trim() -ne '') { $_.years_of_experience } else { '0' }}},
        availability, approval_status,
        @{N='approval_reason';E={if ($_.approval_reason -and $_.approval_reason.Trim() -ne '') { $_.approval_reason } else { $null }}},
        @{N='rejection_reason';E={if ($_.rejection_reason -and $_.rejection_reason.Trim() -ne '') { $_.rejection_reason } else { $null }}},
        @{N='suspension_reason';E={if ($_.suspension_reason -and $_.suspension_reason.Trim() -ne '') { $_.suspension_reason } else { $null }}},
        is_verified, is_active, average_rating, total_reviews, created_at, created_by, updated_at, updated_by,
        @{N='deleted_at';E={if ($_.deleted_at -and $_.deleted_at.Trim() -ne '') { $_.deleted_at } else { $null }}}
    $tempVendors = Join-Path $tempDir "vendors_temp.csv"
    $transformed | Export-Csv $tempVendors -NoTypeInformation -Force
    Import-TableData "vendors" "temp\vendors_temp.csv" "id,user_id,business_name,vendor_code,primary_category,category_id,description,contact_person,email,phone,address,city,state,postal_code,location,latitude,longitude,years_of_experience,availability,approval_status,approval_reason,rejection_reason,suspension_reason,is_verified,is_active,average_rating,total_reviews,created_at,created_by,updated_at,updated_by,deleted_at"
} else {
    Write-Host "  ⊘ vendors - CSV not found" -ForegroundColor DarkGray
    $failed++
}

# vendor_availabilities - now includes all columns, handle empty timestamps properly
$vendorAvailCsv = Join-Path $csvPath "vendor_availabilities.csv"
if (Test-Path $vendorAvailCsv) {
    Write-Host "  Transforming vendor_availabilities..." -ForegroundColor DarkGray
    $data = Import-Csv $vendorAvailCsv
    $transformed = $data | Select-Object id, vendor_id, day_of_week, start_time, end_time, 
        @{N='is_recurring';E={$_.is_recurring}},
        @{N='start_ts';E={if ($_.start_ts -and $_.start_ts.Trim() -ne '' -and $_.start_ts -ne 'True' -and $_.start_ts -ne 'False') { $_.start_ts } else { $null }}},
        @{N='end_ts';E={if ($_.end_ts -and $_.end_ts.Trim() -ne '' -and $_.end_ts -ne 'True' -and $_.end_ts -ne 'False') { $_.end_ts } else { $null }}},
        created_at
    $tempVendorAvail = Join-Path $tempDir "vendor_availabilities_temp.csv"
    $transformed | Export-Csv $tempVendorAvail -NoTypeInformation -Force
    Import-TableData "vendor_availabilities" "temp\vendor_availabilities_temp.csv" "id,vendor_id,day_of_week,start_time,end_time,is_recurring,start_ts,end_ts,created_at"
} else {
    Write-Host "  ⊘ vendor_availabilities - CSV not found" -ForegroundColor DarkGray
    $failed++
}

Write-Host "`n  Service Tables:" -ForegroundColor Cyan

# Transform services - convert decimal times to HH:MM:SS, convert timestamps, map category_id, handle empty fields
$servicesCsv = Join-Path $csvPath "services.csv"
if (Test-Path $servicesCsv) {
    Write-Host "  Transforming services..." -ForegroundColor DarkGray
    $data = Import-Csv $servicesCsv
    
    # Function to convert decimal time to HH:MM:SS
    function Convert-DecimalToTime {
        param($decimal)
        if ([string]::IsNullOrWhiteSpace($decimal)) { return $null }
        $decimalValue = [double]$decimal
        $hours = [math]::Floor($decimalValue * 24)
        $minutes = [math]::Floor(($decimalValue * 24 - $hours) * 60)
        return "{0:D2}:{1:D2}:00" -f $hours, $minutes
    }
    
    # Function to convert Excel serial date to timestamp
    function Convert-ExcelToTimestamp {
        param($excelDate)
        if ([string]::IsNullOrWhiteSpace($excelDate)) { return $null }
        $baseDate = Get-Date "1899-12-30"
        $dateValue = [double]$excelDate
        return $baseDate.AddDays($dateValue).ToString("yyyy-MM-dd HH:mm:ss")
    }
    
    $transformed = $data | Select-Object id, vendor_id, service_name, category,
        @{N='category_id';E={
            $catId = [int]$_.category_id
            # Map invalid category IDs to valid ones (1-6, 20)
            if ($catId -in @(1,2,3,4,5,6,20)) { $catId }
            elseif ($catId -ge 7 -and $catId -le 12) { 1 }  # Map 7-12 to Home Services
            elseif ($catId -ge 13 -and $catId -le 17) { 6 } # Map 13-17 to Beauty & Wellness
            else { 20 }  # Map rest to Appliance Repair
        }},
        category_legacy, description, price, duration_minutes, address, city, state, postal_code, latitude, longitude,
        @{N='available_from_time';E={Convert-DecimalToTime $_.available_from_time}},
        @{N='available_to_time';E={Convert-DecimalToTime $_.available_to_time}},
        is_available, is_featured, approval_status,
        @{N='approval_reason';E={if ($_.approval_reason -and $_.approval_reason.Trim() -ne '') { $_.approval_reason } else { $null }}},
        @{N='rejection_reason';E={if ($_.rejection_reason -and $_.rejection_reason.Trim() -ne '') { $_.rejection_reason } else { $null }}},
        average_rating, total_reviews, is_active,
        @{N='created_at';E={Convert-ExcelToTimestamp $_.created_at}},
        @{N='updated_at';E={Convert-ExcelToTimestamp $_.updated_at}},
        @{N='deleted_at';E={if ($_.deleted_at -and $_.deleted_at.Trim() -ne '') { Convert-ExcelToTimestamp $_.deleted_at } else { $null }}}
    
    $tempServices = Join-Path $tempDir "services_temp.csv"
    $transformed | Export-Csv $tempServices -NoTypeInformation -Force
    Import-TableData "services" "temp\services_temp.csv" "id,vendor_id,service_name,category,category_id,category_legacy,description,price,duration_minutes,address,city,state,postal_code,latitude,longitude,available_from_time,available_to_time,is_available,is_featured,approval_status,approval_reason,rejection_reason,average_rating,total_reviews,is_active,created_at,updated_at,deleted_at"
} else {
    Write-Host "  ⊘ services - CSV not found" -ForegroundColor DarkGray
    $failed++
}

# favorites - load all rows (do not drop duplicates here; let DB constraints or a separate dedupe step handle duplicates)
$favoritesCsv = Join-Path $csvPath "favorites.csv"
if (Test-Path $favoritesCsv) {
    Write-Host "  Loading favorites (no dedupe) ..." -ForegroundColor DarkGray
    Import-TableData "favorites" "favorites.csv" "id,user_id,service_id,created_at"
} else {
    Write-Host "  ⊘ favorites - CSV not found" -ForegroundColor DarkGray
    $failed++
}

# cart_items - now includes is_active, use created_at for added_at
$cartCsv = Join-Path $csvPath "cart_items.csv"
if (Test-Path $cartCsv) {
    Write-Host "  Transforming cart_items..." -ForegroundColor DarkGray
    $data = Import-Csv $cartCsv
    $transformed = $data | Select-Object id, user_id, service_id, quantity, 
        @{N='added_at';E={$_.created_at}}, is_active, created_at, updated_at
    $tempCart = Join-Path $tempDir "cart_items_temp.csv"
    $transformed | Export-Csv $tempCart -NoTypeInformation -Force
    Import-TableData "cart_items" "temp\cart_items_temp.csv" "id,user_id,service_id,quantity,added_at,is_active,created_at,updated_at"
} else {
    Write-Host "  ⊘ cart_items - CSV not found" -ForegroundColor DarkGray
    $failed++
}

Write-Host "`n  Booking Tables:" -ForegroundColor Cyan

# bookings - Direct load with all columns matching database schema
$bookingsCsv = Join-Path $csvPath "bookings.csv"
if (Test-Path $bookingsCsv) {
    Import-TableData "bookings" "bookings.csv" "id,user_id,service_id,vendor_id,booking_reference,service_name_at_booking,service_price_at_booking,scheduled_at,booking_date,booking_time,time_slot,status,price_total,price_service,price_tax,price_discount,payment_method,payment_status,special_requests,cancellation_reason,cancelled_at,cancelled_by,completed_at,created_at,created_by,updated_at,updated_by,deleted_at"
} else {
    Write-Host "  ⊘ bookings - CSV not found" -ForegroundColor DarkGray
    $failed++
}

# reviews - need to get vendor_id from bookings table, remove duplicates by booking_id
$reviewsCsv = Join-Path $csvPath "reviews.csv"
if (Test-Path $reviewsCsv) {
    Write-Host "  Transforming reviews (joining with bookings for vendor_id)..." -ForegroundColor DarkGray
    # First, get bookings data to lookup vendor_id
    $bookingsLookup = @{}
    if (Test-Path (Join-Path $csvPath "bookings.csv")) {
        $bookingsData = Import-Csv (Join-Path $csvPath "bookings.csv")
        foreach ($booking in $bookingsData) {
            $bookingsLookup[$booking.id] = $booking.vendor_id
        }
    }
    
    $data = Import-Csv $reviewsCsv
    # Remove duplicates by booking_id - keep first occurrence only
    # Keep all reviews; attach vendor_id when available, otherwise leave NULL for manual resolution
    $transformed = $data | ForEach-Object {
        $review = $_
        $vendorId = $null
        if ($bookingsLookup.ContainsKey($review.booking_id)) { $vendorId = $bookingsLookup[$review.booking_id] }
        [PSCustomObject]@{
            id = $review.id
            booking_id = $review.booking_id
            user_id = $review.user_id
            vendor_id = $vendorId
            service_id = $review.service_id
            rating = $review.rating
            comment = $review.comment
            created_at = $review.created_at
            updated_at = if ($review.updated_at -and $review.updated_at.Trim() -ne '') { $review.updated_at } else { $review.created_at }
        }
    }
    $tempReviews = Join-Path $tempDir "reviews_temp.csv"
    $transformed | Export-Csv $tempReviews -NoTypeInformation -Force
    Import-TableData "reviews" "temp\reviews_temp.csv" "id,booking_id,user_id,vendor_id,service_id,rating,comment,created_at,updated_at"
} else {
    Write-Host "  ⊘ reviews - CSV not found" -ForegroundColor DarkGray
    $failed++
}

# payments - Direct load with all columns matching database schema
$paymentsCsv = Join-Path $csvPath "payments.csv"
if (Test-Path $paymentsCsv) {
    Import-TableData "payments" "payments.csv" "id,booking_id,user_id,amount,currency,payment_method,payment_provider,transaction_id,payment_status,paid_at,refunded_at,created_at,created_by,updated_at,updated_by,deleted_at"
} else {
    Write-Host "  ⊘ payments - CSV not found" -ForegroundColor DarkGray
    $failed++
}

# refunds - need to get payment_id from payments table, map REJECTED to FAILED
$refundsCsv = Join-Path $csvPath "refunds.csv"
if (Test-Path $refundsCsv) {
    Write-Host "  Transforming refunds (joining with payments for payment_id)..." -ForegroundColor DarkGray
    # First, get payments data to lookup payment_id by booking_id
    $paymentsLookup = @{}
    if (Test-Path (Join-Path $csvPath "payments.csv")) {
        $paymentsData = Import-Csv (Join-Path $csvPath "payments.csv")
        foreach ($payment in $paymentsData) {
            # Store first payment_id for each booking_id
            if (-not $paymentsLookup.ContainsKey($payment.booking_id)) {
                $paymentsLookup[$payment.booking_id] = $payment.id
            }
        }
    }
    
    $data = Import-Csv $refundsCsv
    # Preserve refunds even if a matching payment is not found. Set payment_id NULL and flag via 'payment_missing' column for review.
    $transformed = $data | ForEach-Object {
        $paymentId = $null
        if ($paymentsLookup.ContainsKey($_.booking_id)) { $paymentId = $paymentsLookup[$_.booking_id] }
        # Map REJECTED to FAILED to match DB constraint
        $status = $_.status
        if ($status -eq 'REJECTED') { $status = 'FAILED' }

        [PSCustomObject]@{
            id = $_.id
            payment_id = $paymentId
            booking_id = $_.booking_id
            amount = $_.amount
            reason = $_.reason
            refund_status = $status
            processed_at = if ($_.processed_at -and $_.processed_at.Trim() -ne '') { $_.processed_at } else { $null }
            created_at = $_.created_at
            updated_at = if ($_.updated_at -and $_.updated_at.Trim() -ne '') { $_.updated_at } else { $_.created_at }
            payment_missing = if ($paymentId -eq $null) { 'true' } else { 'false' }
        }
    }
    # Export full audit file (includes payment_missing) and an import-only file with exactly the DB columns
    $tempRefundsAudit = Join-Path $tempDir "refunds_audit.csv"
    $tempRefundsImport = Join-Path $tempDir "refunds_import.csv"
    $transformed | Export-Csv $tempRefundsAudit -NoTypeInformation -Force
    # Create import-only projection
    $transformed | Select-Object id,payment_id,booking_id,amount,reason,refund_status,processed_at,created_at,updated_at | Export-Csv $tempRefundsImport -NoTypeInformation -Force
    Import-TableData "refunds" "temp\refunds_import.csv" "id,payment_id,booking_id,amount,reason,refund_status,processed_at,created_at,updated_at"
} else {
    Write-Host "  ⊘ refunds - CSV not found" -ForegroundColor DarkGray
    $failed++
}

Write-Host "`n  Tracking Tables:" -ForegroundColor Cyan

# coupon_usages - rename and reorder
$couponUsageCsv = Join-Path $csvPath "coupon_usages.csv"
if (Test-Path $couponUsageCsv) {
    Write-Host "  Transforming coupon_usages..." -ForegroundColor DarkGray
    $data = Import-Csv $couponUsageCsv
    $transformed = $data | Select-Object id, coupon_id, user_id, booking_id, 
        @{N='discount_amount';E={$_.discount_applied}}, 
        used_at
    $tempCouponUsage = Join-Path $tempDir "coupon_usages_temp.csv"
    $transformed | Export-Csv $tempCouponUsage -NoTypeInformation -Force
    Import-TableData "coupon_usages" "temp\coupon_usages_temp.csv" "id,coupon_id,user_id,booking_id,discount_amount,used_at"
} else {
    Write-Host "  ⊘ coupon_usages - CSV not found" -ForegroundColor DarkGray
    $failed++
}

# audit_logs - reorder columns
$auditCsv = Join-Path $csvPath "audit_logs.csv"
if (Test-Path $auditCsv) {
    Write-Host "  Transforming audit_logs..." -ForegroundColor DarkGray
    $data = Import-Csv $auditCsv
    $transformed = $data | Select-Object id, entity_type, entity_id, action, created_at, performed_by
    $tempAudit = Join-Path $tempDir "audit_logs_temp.csv"
    $transformed | Export-Csv $tempAudit -NoTypeInformation -Force
    Import-TableData "audit_logs" "temp\audit_logs_temp.csv" "id,entity_type,entity_id,action,created_at,performed_by"
} else {
    Write-Host "  ⊘ audit_logs - CSV not found" -ForegroundColor DarkGray
    $failed++
}

# ============================================================================
# SUMMARY
# ============================================================================
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       SUMMARY                          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "  Success: " -NoNewline -ForegroundColor White
Write-Host "$success tables" -ForegroundColor Green
Write-Host "  Failed:  " -NoNewline -ForegroundColor White
Write-Host "$failed tables" -ForegroundColor Red

if ($success -gt 0) {
    $totalSQL = "SELECT SUM(n_live_tup) FROM pg_stat_user_tables WHERE schemaname='public';"
    $total = & $psql -h $dbHost -p $dbPort -U $user -d $db -t -c $totalSQL 2>&1
    $total = $total.Trim()
    Write-Host "`n  Total Records: " -NoNewline -ForegroundColor White
    Write-Host "$total" -ForegroundColor Cyan
    
    # Show loaded tables
    Write-Host "`n  Loaded Tables:" -ForegroundColor Cyan
    $tablesSQL = "SELECT schemaname||'.'||relname as table_name, n_live_tup as rows FROM pg_stat_user_tables WHERE n_live_tup > 0 ORDER BY n_live_tup DESC;"
    & $psql -h $dbHost -p $dbPort -U $user -d $db -c $tablesSQL
}

# Cleanup temp directory
Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "`n✓ Database loading complete!" -ForegroundColor Green
Write-Host ""
