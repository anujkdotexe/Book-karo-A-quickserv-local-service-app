# Admin Resend Notification Test Script
Write-Host "=== ADMIN RESEND NOTIFICATION TEST ===" -ForegroundColor Cyan

# Login as admin
Write-Host "`n1. Logging in as admin..." -ForegroundColor Yellow
$adminLogin = @{ 
    email = 'admin@bookkaro.com'
    password = 'Password@123' 
} | ConvertTo-Json

try {
    $adminResp = Invoke-RestMethod -Uri 'http://localhost:8081/api/v1/auth/login' `
        -Method Post `
        -Body $adminLogin `
        -ContentType 'application/json'
    $adminHeaders = @{ 'Authorization' = "Bearer $($adminResp.data.token)" }
    Write-Host "   ✅ Admin logged in successfully" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Admin login failed: $_" -ForegroundColor Red
    exit 1
}

# Get announcements
Write-Host "`n2. Fetching announcements..." -ForegroundColor Yellow
try {
    $announcements = Invoke-RestMethod -Uri 'http://localhost:8081/api/v1/admin/content/announcements' `
        -Headers $adminHeaders
    Write-Host "   ✅ Found $($announcements.data.Count) announcements" -ForegroundColor Green
    
    if ($announcements.data.Count -gt 0) {
        $announcementId = $announcements.data[0].id
        $announcementTitle = $announcements.data[0].title
        Write-Host "   📌 Testing with: #$announcementId - $announcementTitle" -ForegroundColor Cyan
        
        # Resend notifications
        Write-Host "`n3. Resending notifications..." -ForegroundColor Yellow
        try {
            $resendResp = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/admin/content/announcements/$announcementId/resend-notifications" `
                -Method Post `
                -Headers $adminHeaders
            Write-Host "   ✅ $($resendResp.message)" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ Resend failed: $_" -ForegroundColor Red
        }
        
        # Verify by checking user notifications
        Write-Host "`n4. Verifying notifications were created..." -ForegroundColor Yellow
        $userLogin = @{ 
            email = 'user@bookkaro.com'
            password = 'Password@123' 
        } | ConvertTo-Json
        
        try {
            $userResp = Invoke-RestMethod -Uri 'http://localhost:8081/api/v1/auth/login' `
                -Method Post `
                -Body $userLogin `
                -ContentType 'application/json'
            $userHeaders = @{ 'Authorization' = "Bearer $($userResp.data.token)" }
            
            $unread = Invoke-RestMethod -Uri 'http://localhost:8081/api/v1/notifications/unread-count' `
                -Headers $userHeaders
            Write-Host "   ✅ User has $($unread.data) unread notifications" -ForegroundColor Green
            
            $all = Invoke-RestMethod -Uri 'http://localhost:8081/api/v1/notifications/all' `
                -Headers $userHeaders
            Write-Host "   ✅ User has $($all.data.Count) total notifications" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ Verification failed: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "   ⚠️  No announcements available to test resend" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Failed to fetch announcements: $_" -ForegroundColor Red
}

Write-Host "`n=== TEST COMPLETE ===" -ForegroundColor Cyan
