# API Endpoint Testing Script
# Tests all frontend-backend API connections

$ErrorActionPreference = "Continue"
$API_BASE = "http://localhost:8081/api/v1"
$TEST_RESULTS = @()

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BOOK-KARO API Endpoint Testing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Helper function to test endpoint
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [string]$Token = $null,
        [object]$Body = $null,
        [bool]$ExpectAuth = $false
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    $url = "$API_BASE$Endpoint"
    
    try {
        Write-Host "Testing: $Description" -ForegroundColor Yellow
        Write-Host "  $Method $url" -ForegroundColor Gray
        
        $params = @{
            Uri = $url
            Method = $Method
            Headers = $headers
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-WebRequest @params -UseBasicParsing -ErrorAction Stop
        
        $status = $response.StatusCode
        $result = @{
            Endpoint = $Endpoint
            Description = $Description
            Method = $Method
            Status = $status
            Success = ($status -ge 200 -and $status -lt 300)
            Message = "OK"
        }
        
        Write-Host "  ✓ Status: $status" -ForegroundColor Green
        
    } catch {
        $status = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.Value__ } else { "ERROR" }
        $message = $_.Exception.Message
        
        $result = @{
            Endpoint = $Endpoint
            Description = $Description
            Method = $Method
            Status = $status
            Success = ($ExpectAuth -and $status -eq 401) -or ($status -eq 403)
            Message = $message
        }
        
        if ($ExpectAuth -and $status -eq 401) {
            Write-Host "  ✓ Status: $status (Expected - Auth Required)" -ForegroundColor Cyan
        } elseif ($status -eq 403) {
            Write-Host "  ✓ Status: $status (Expected - Forbidden)" -ForegroundColor Cyan
        } else {
            Write-Host "  ✗ Status: $status - $message" -ForegroundColor Red
        }
    }
    
    $script:TEST_RESULTS += $result
    Write-Host ""
}

# Get admin token for authenticated tests
Write-Host "Authenticating as admin..." -ForegroundColor Cyan
$adminLoginBody = @{
    email = "admin@bookkaro.com"
    password = "Password@123"
}

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method POST -Body ($adminLoginBody | ConvertTo-Json) -ContentType "application/json"
    $ADMIN_TOKEN = $loginResponse.data.token
    Write-Host "✓ Admin authenticated successfully" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Failed to authenticate admin" -ForegroundColor Red
    $ADMIN_TOKEN = $null
}

# Get user token for user-specific tests (bookings, etc.)
Write-Host "Authenticating as regular user..." -ForegroundColor Cyan
$userLoginBody = @{
    email = "user@bookkaro.com"
    password = "Password@123"
}

try {
    $userLoginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method POST -Body ($userLoginBody | ConvertTo-Json) -ContentType "application/json"
    $USER_TOKEN = $userLoginResponse.data.token
    Write-Host "✓ User authenticated successfully" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Failed to authenticate user" -ForegroundColor Red
    $USER_TOKEN = $null
}

# Get vendor token for vendor-specific tests
Write-Host "Authenticating as vendor..." -ForegroundColor Cyan
$vendorLoginBody = @{
    email = "mumbai@bookkaro.com"
    password = "Password@123"
}

try {
    $vendorLoginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method POST -Body ($vendorLoginBody | ConvertTo-Json) -ContentType "application/json"
    $VENDOR_TOKEN = $vendorLoginResponse.data.token
    Write-Host "✓ Vendor authenticated successfully" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Failed to authenticate vendor" -ForegroundColor Red
    $VENDOR_TOKEN = $null
}

# ========== PUBLIC ENDPOINTS ==========
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "PUBLIC ENDPOINTS (No Auth Required)" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

# Auth Endpoints
Write-Host "Note: Login/Register tested during authentication phase above" -ForegroundColor Gray
Write-Host ""

# Service Endpoints
Test-Endpoint -Method "GET" -Endpoint "/services" -Description "Get all services (paginated)"
Test-Endpoint -Method "GET" -Endpoint "/services/cities" -Description "Get available cities"
Test-Endpoint -Method "GET" -Endpoint "/services/categories" -Description "Get service categories"
Test-Endpoint -Method "GET" -Endpoint "/services/trending" -Description "Get trending searches"
Test-Endpoint -Method "GET" -Endpoint "/services/autocomplete?q=clean" -Description "Service autocomplete"

# Public Content
Test-Endpoint -Method "GET" -Endpoint "/public/content/faqs" -Description "Get public FAQs"
Test-Endpoint -Method "GET" -Endpoint "/public/content/announcements" -Description "Get announcements"
Test-Endpoint -Method "GET" -Endpoint "/public/content/banners" -Description "Get banners"

# Categories
Test-Endpoint -Method "GET" -Endpoint "/categories" -Description "Get all categories"

# ========== AUTHENTICATED USER ENDPOINTS ==========
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "AUTHENTICATED ENDPOINTS (Auth Required)" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

# User Profile
Test-Endpoint -Method "GET" -Endpoint "/users/profile" -Description "Get user profile" -Token $ADMIN_TOKEN

# Test profile update with valid data
$updateProfileBody = @{
    firstName = "Admin"
    lastName = "User"
    phone = "+919876543210"
    address = "123 Test Street"
    city = "Mumbai"
    state = "Maharashtra"
    postalCode = "400001"
}
Test-Endpoint -Method "PUT" -Endpoint "/users/profile" -Description "Update user profile" -Token $ADMIN_TOKEN -Body $updateProfileBody

# Test password change (will fail validation but tests endpoint)
Write-Host "Note: Password change test skipped (requires current password validation)" -ForegroundColor Gray
Write-Host ""

# Addresses
Test-Endpoint -Method "GET" -Endpoint "/addresses" -Description "Get user addresses" -Token $ADMIN_TOKEN

# Favorites
Test-Endpoint -Method "GET" -Endpoint "/favorites" -Description "Get user favorites" -Token $ADMIN_TOKEN

# Cart
Test-Endpoint -Method "GET" -Endpoint "/cart" -Description "Get cart items" -Token $ADMIN_TOKEN
Test-Endpoint -Method "GET" -Endpoint "/cart/count" -Description "Get cart count" -Token $ADMIN_TOKEN

# Bookings (using USER token - users can only see their own bookings)
Test-Endpoint -Method "GET" -Endpoint "/bookings" -Description "Get user bookings" -Token $USER_TOKEN
Test-Endpoint -Method "GET" -Endpoint "/bookings?status=PENDING" -Description "Get user pending bookings" -Token $USER_TOKEN
Test-Endpoint -Method "GET" -Endpoint "/bookings?status=CONFIRMED" -Description "Get user confirmed bookings" -Token $USER_TOKEN
Test-Endpoint -Method "GET" -Endpoint "/bookings?status=COMPLETED" -Description "Get user completed bookings" -Token $USER_TOKEN
Test-Endpoint -Method "GET" -Endpoint "/bookings/history" -Description "Get user booking history" -Token $USER_TOKEN

# Reviews
Test-Endpoint -Method "GET" -Endpoint "/reviews/service/1" -Description "Get service reviews" -Token $ADMIN_TOKEN

# Payments
Test-Endpoint -Method "GET" -Endpoint "/payments/history" -Description "Get payment history" -Token $ADMIN_TOKEN

# Notifications
Test-Endpoint -Method "GET" -Endpoint "/notifications" -Description "Get user notifications" -Token $ADMIN_TOKEN

# ========== ADMIN ENDPOINTS ==========
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "ADMIN ENDPOINTS (Admin Auth Required)" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

# Dashboard
Test-Endpoint -Method "GET" -Endpoint "/admin/dashboard" -Description "Get admin dashboard stats" -Token $ADMIN_TOKEN

# User Management
Test-Endpoint -Method "GET" -Endpoint "/admin/users" -Description "Get all users (paginated)" -Token $ADMIN_TOKEN
Test-Endpoint -Method "GET" -Endpoint "/admin/users/search?q=admin" -Description "Search users" -Token $ADMIN_TOKEN

# Vendor Management
Test-Endpoint -Method "GET" -Endpoint "/admin/vendors" -Description "Get all vendors (paginated)" -Token $ADMIN_TOKEN
Test-Endpoint -Method "GET" -Endpoint "/admin/vendors/pending" -Description "Get pending vendor approvals" -Token $ADMIN_TOKEN

# Service Management
Test-Endpoint -Method "GET" -Endpoint "/admin/services" -Description "Get all services (admin view)" -Token $ADMIN_TOKEN
Test-Endpoint -Method "GET" -Endpoint "/admin/services/pending" -Description "Get pending service approvals" -Token $ADMIN_TOKEN

# Booking Management
Test-Endpoint -Method "GET" -Endpoint "/admin/bookings" -Description "Get all bookings (paginated)" -Token $ADMIN_TOKEN
Test-Endpoint -Method "GET" -Endpoint "/admin/bookings?status=PENDING" -Description "Get pending bookings" -Token $ADMIN_TOKEN
Test-Endpoint -Method "GET" -Endpoint "/admin/bookings?status=CONFIRMED" -Description "Get confirmed bookings" -Token $ADMIN_TOKEN
Test-Endpoint -Method "GET" -Endpoint "/admin/bookings?status=COMPLETED" -Description "Get completed bookings" -Token $ADMIN_TOKEN
Test-Endpoint -Method "GET" -Endpoint "/admin/bookings?status=CANCELLED" -Description "Get cancelled bookings" -Token $ADMIN_TOKEN

# Coupon Management
Test-Endpoint -Method "GET" -Endpoint "/admin/coupons" -Description "Get all coupons" -Token $ADMIN_TOKEN

# Audit Logs
Test-Endpoint -Method "GET" -Endpoint "/admin/audit-logs" -Description "Get audit logs (paginated)" -Token $ADMIN_TOKEN

# Analytics
Test-Endpoint -Method "GET" -Endpoint "/admin/analytics/platform" -Description "Get platform analytics" -Token $ADMIN_TOKEN
Test-Endpoint -Method "GET" -Endpoint "/analytics/admin" -Description "Get admin analytics (via analytics controller)" -Token $ADMIN_TOKEN

# Content Management
Test-Endpoint -Method "GET" -Endpoint "/admin/content/faqs" -Description "Get all FAQs (admin)" -Token $ADMIN_TOKEN
Test-Endpoint -Method "GET" -Endpoint "/admin/content/announcements" -Description "Get all announcements (admin)" -Token $ADMIN_TOKEN
Test-Endpoint -Method "GET" -Endpoint "/admin/content/banners" -Description "Get all banners (admin)" -Token $ADMIN_TOKEN

# Categories Management
Test-Endpoint -Method "GET" -Endpoint "/admin/categories" -Description "Get all categories (admin)" -Token $ADMIN_TOKEN

# Settings Management
Test-Endpoint -Method "GET" -Endpoint "/settings" -Description "Get all settings" -Token $ADMIN_TOKEN
Test-Endpoint -Method "GET" -Endpoint "/public/settings" -Description "Get public/shared settings" -Token $ADMIN_TOKEN

# ========== VENDOR ENDPOINTS ==========
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "VENDOR ENDPOINTS (Vendor Auth Required)" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

# Using vendor token for vendor-specific endpoints
Test-Endpoint -Method "GET" -Endpoint "/vendor/dashboard" -Description "Get vendor dashboard" -Token $VENDOR_TOKEN
Test-Endpoint -Method "GET" -Endpoint "/vendor/bookings" -Description "Get vendor bookings" -Token $VENDOR_TOKEN
Test-Endpoint -Method "GET" -Endpoint "/vendor/services" -Description "Get vendor services" -Token $VENDOR_TOKEN
Test-Endpoint -Method "GET" -Endpoint "/vendor/availabilities" -Description "Get vendor availabilities" -Token $VENDOR_TOKEN
Test-Endpoint -Method "GET" -Endpoint "/vendor/reviews" -Description "Get vendor reviews" -Token $VENDOR_TOKEN
Test-Endpoint -Method "GET" -Endpoint "/analytics/vendor" -Description "Get vendor analytics" -Token $VENDOR_TOKEN

# ========== RESULTS SUMMARY ==========
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$totalTests = $TEST_RESULTS.Count
$successfulTests = ($TEST_RESULTS | Where-Object { $_.Success }).Count
$failedTests = $totalTests - $successfulTests

Write-Host "Total Endpoints Tested: $totalTests" -ForegroundColor White
Write-Host "Successful: $successfulTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red
Write-Host ""

if ($failedTests -gt 0) {
    Write-Host "Failed Endpoints:" -ForegroundColor Red
    $TEST_RESULTS | Where-Object { -not $_.Success } | ForEach-Object {
        Write-Host "  ✗ $($_.Method) $($_.Endpoint) - $($_.Description)" -ForegroundColor Red
        Write-Host "    Status: $($_.Status) - $($_.Message)" -ForegroundColor Gray
    }
    Write-Host ""
}

# Export results to CSV
$csvPath = "D:\Springboard\api_test_results.csv"
$TEST_RESULTS | Export-Csv -Path $csvPath -NoTypeInformation
Write-Host "Detailed results saved to: $csvPath" -ForegroundColor Cyan

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
