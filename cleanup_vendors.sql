-- Bookaro Database Cleanup Script
-- Remove all generated vendors except the test vendor
-- Keep only vendor@bookaro.com with all services

-- Step 1: Find the test vendor ID
-- vendor@bookaro.com (VendorCode: TEST001)

-- Step 2: Reassign ALL services to the test vendor
UPDATE services 
SET vendor_id = (SELECT id FROM vendors WHERE vendor_code = 'TEST001')
WHERE vendor_id IN (
    SELECT id FROM vendors WHERE vendor_code LIKE 'VEN%'
);

-- Step 3: Delete generated vendor accounts (vendor1-50@bookaro.com)
DELETE FROM users 
WHERE email LIKE 'vendor%@bookaro.com' 
AND email != 'vendor@bookaro.com';

-- Step 4: Delete generated vendors (VEN001-VEN050)
DELETE FROM vendors 
WHERE vendor_code LIKE 'VEN%';

-- Step 5: Verify the cleanup
SELECT 'Total Vendors' as check_type, COUNT(*) as count FROM vendors
UNION ALL
SELECT 'Total Services', COUNT(*) FROM services
UNION ALL
SELECT 'Services linked to TEST001', COUNT(*) FROM services WHERE vendor_id = (SELECT id FROM vendors WHERE vendor_code = 'TEST001')
UNION ALL
SELECT 'Vendor users', COUNT(*) FROM users WHERE role = 'VENDOR';
