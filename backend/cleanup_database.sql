-- Cleanup script to remove ALL vendors and services
-- Keeps only 3 test user accounts (user, vendor, admin)
-- Regional vendor user accounts will be recreated by initializers

BEGIN;

-- Delete all reviews first (depends on bookings, services, users)
DELETE FROM reviews;

-- Delete all bookings (depends on services and users)
DELETE FROM bookings;

-- Delete all services (depends on vendors)
DELETE FROM services;

-- Delete all vendors
DELETE FROM vendors;

-- Delete regional vendor USER accounts (will be recreated)
DELETE FROM users WHERE email IN (
    'mumbai@bookaro.com',
    'pune@bookaro.com',
    'delhi@bookaro.com',
    'bangalore@bookaro.com',
    'thane@bookaro.com',
    'navimumbai@bookaro.com'
);

-- Keep only these 3 test accounts:
-- user@bookaro.com
-- vendor@bookaro.com
-- admin@bookaro.com

-- Verify final counts
SELECT 'Users remaining:' as info, COUNT(*) as count FROM users;
SELECT 'Vendors remaining:' as info, COUNT(*) as count FROM vendors;
SELECT 'Services remaining:' as info, COUNT(*) as count FROM services;
SELECT 'Bookings remaining:' as info, COUNT(*) as count FROM bookings;
SELECT 'Reviews remaining:' as info, COUNT(*) as count FROM reviews;

COMMIT;
