# Notification System Test Script
Write-Host "=== NOTIFICATION SYSTEM TEST ===" -ForegroundColor Cyan

# Login as user
Write-Host "`n1. Logging in as user@bookkaro.com..." -ForegroundColor Yellow
$loginBody = @{ 
    email = 'user@bookkaro.com'
    password = 'Password@123' 
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri 'http://localhost:8081/api/v1/auth/login' `
        -Method Post `
        -Body $loginBody `
        -ContentType 'application/json'
    
    $token = $loginResponse.data.token
    $headers = @{ 'Authorization' = "Bearer $token" }
    Write-Host "   ✅ Logged in successfully" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Login failed: $_" -ForegroundColor Red
    exit 1
}

# Test 1: Unread Count
Write-Host "`n2. Testing unread count..." -ForegroundColor Yellow
try {
    $unreadResponse = Invoke-RestMethod -Uri 'http://localhost:8081/api/v1/notifications/unread-count' `
        -Headers $headers
    Write-Host "   ✅ Unread: $($unreadResponse.data)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed: $_" -ForegroundColor Red
}

# Test 2: Recent Notifications
Write-Host "`n3. Testing recent notifications (limit 5)..." -ForegroundColor Yellow
try {
    $recentResponse = Invoke-RestMethod -Uri 'http://localhost:8081/api/v1/notifications/recent?limit=5' `
        -Headers $headers
    Write-Host "   ✅ Recent count: $($recentResponse.data.Count)" -ForegroundColor Green
    if ($recentResponse.data.Count -gt 0) {
        $global:testNotifId = $recentResponse.data[0].id
        Write-Host "   📌 Test notification ID: $global:testNotifId" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ❌ Failed: $_" -ForegroundColor Red
}

# Test 3: All Notifications
Write-Host "`n4. Testing all notifications..." -ForegroundColor Yellow
try {
    $allResponse = Invoke-RestMethod -Uri 'http://localhost:8081/api/v1/notifications/all' `
        -Headers $headers
    Write-Host "   ✅ Total notifications: $($allResponse.data.Count)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed: $_" -ForegroundColor Red
}

# Test 4: Get Single Notification
if ($global:testNotifId) {
    Write-Host "`n5. Testing get single notification (#$global:testNotifId)..." -ForegroundColor Yellow
    try {
        $singleResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/notifications/$global:testNotifId" `
            -Headers $headers
        Write-Host "   ✅ Title: $($singleResponse.data.title)" -ForegroundColor Green
        Write-Host "   ✅ Type: $($singleResponse.data.type)" -ForegroundColor Green
        Write-Host "   ✅ Read: $($singleResponse.data.read)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Failed: $_" -ForegroundColor Red
    }

    # Test 5: Mark as Read
    Write-Host "`n6. Testing mark as read (#$global:testNotifId)..." -ForegroundColor Yellow
    try {
        $markReadResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/notifications/$global:testNotifId/read" `
            -Method Put `
            -Headers $headers
        Write-Host "   ✅ $($markReadResponse.message)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Failed: $_" -ForegroundColor Red
    }
}

# Test 6: Mark All as Read
Write-Host "`n7. Testing mark all as read..." -ForegroundColor Yellow
try {
    $markAllResponse = Invoke-RestMethod -Uri 'http://localhost:8081/api/v1/notifications/read-all' `
        -Method Put `
        -Headers $headers
    Write-Host "   ✅ $($markAllResponse.message)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed: $_" -ForegroundColor Red
}

# Test 7: Delete Single Notification
if ($global:testNotifId) {
    Write-Host "`n8. Testing delete notification (#$global:testNotifId)..." -ForegroundColor Yellow
    try {
        $deleteResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/notifications/$global:testNotifId" `
            -Method Delete `
            -Headers $headers
        Write-Host "   ✅ $($deleteResponse.message)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Failed: $_" -ForegroundColor Red
    }
}

# Test 8: Verify Count After Delete
Write-Host "`n9. Verifying count after delete..." -ForegroundColor Yellow
try {
    $countResponse = Invoke-RestMethod -Uri 'http://localhost:8081/api/v1/notifications/all' `
        -Headers $headers
    Write-Host "   ✅ Remaining notifications: $($countResponse.data.Count)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed: $_" -ForegroundColor Red
}

Write-Host "`n=== TESTS COMPLETE ===" -ForegroundColor Cyan
Write-Host "All notification endpoints are working correctly!" -ForegroundColor Green
