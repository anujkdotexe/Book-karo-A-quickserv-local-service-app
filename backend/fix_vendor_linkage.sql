-- Quick fix to clear vendors and services only
-- This allows ComprehensiveDataInitializer to run again
-- Keeps test users and bookings

BEGIN;

-- Delete all services (depends on vendors)
DELETE FROM services;

-- Delete all vendors
DELETE FROM vendors;

-- Delete regional vendor user accounts (will be recreated with proper linkage)
DELETE FROM users WHERE email IN (
    'mumbai@bookkaro.com',
    'pune@bookkaro.com',
    'delhi@bookkaro.com',
    'bangalore@bookkaro.com',
    'thane@bookkaro.com',
    'navimumbai@bookkaro.com'
);

COMMIT;

-- Verify cleanup
SELECT 'Vendors remaining:', COUNT(*) FROM vendors;
SELECT 'Services remaining:', COUNT(*) FROM services;
SELECT 'Users remaining:', COUNT(*) FROM users;
