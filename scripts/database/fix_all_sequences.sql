-- =====================================================
-- Fix All Database Sequences
-- =====================================================
-- This script resets all sequences to prevent duplicate key violations
-- Run this after importing CSV data or manual inserts

-- 1. CART ITEMS
SELECT setval('cart_items_id_seq', COALESCE((SELECT MAX(id) FROM cart_items), 0) + 1, false);

-- 2. USERS
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1, false);

-- 3. SERVICES
SELECT setval('services_id_seq', COALESCE((SELECT MAX(id) FROM services), 0) + 1, false);

-- 4. BOOKINGS
SELECT setval('bookings_id_seq', COALESCE((SELECT MAX(id) FROM bookings), 0) + 1, false);

-- 5. REVIEWS
SELECT setval('reviews_id_seq', COALESCE((SELECT MAX(id) FROM reviews), 0) + 1, false);

-- 6. PAYMENTS
SELECT setval('payments_id_seq', COALESCE((SELECT MAX(id) FROM payments), 0) + 1, false);

-- 7. REFUNDS
SELECT setval('refunds_id_seq', COALESCE((SELECT MAX(id) FROM refunds), 0) + 1, false);

-- 8. CATEGORIES
SELECT setval('categories_id_seq', COALESCE((SELECT MAX(id) FROM categories), 0) + 1, false);

-- 9. VENDORS
SELECT setval('vendors_id_seq', COALESCE((SELECT MAX(id) FROM vendors), 0) + 1, false);

-- 10. ADDRESSES
SELECT setval('addresses_id_seq', COALESCE((SELECT MAX(id) FROM addresses), 0) + 1, false);

-- 11. COUPONS
SELECT setval('coupons_id_seq', COALESCE((SELECT MAX(id) FROM coupons), 0) + 1, false);

-- 12. COUPON USAGES
SELECT setval('coupon_usages_id_seq', COALESCE((SELECT MAX(id) FROM coupon_usages), 0) + 1, false);

-- 13. FAVORITES
SELECT setval('favorites_id_seq', COALESCE((SELECT MAX(id) FROM favorites), 0) + 1, false);

-- 14. WALLETS
SELECT setval('wallets_id_seq', COALESCE((SELECT MAX(id) FROM wallets), 0) + 1, false);

-- 15. ANNOUNCEMENTS
SELECT setval('announcements_id_seq', COALESCE((SELECT MAX(id) FROM announcements), 0) + 1, false);

-- 16. BANNERS
SELECT setval('banners_id_seq', COALESCE((SELECT MAX(id) FROM banners), 0) + 1, false);

-- 17. FAQS
SELECT setval('faqs_id_seq', COALESCE((SELECT MAX(id) FROM faqs), 0) + 1, false);

-- 18. AUDIT LOGS
SELECT setval('audit_logs_id_seq', COALESCE((SELECT MAX(id) FROM audit_logs), 0) + 1, false);

-- 19. USER ROLES
SELECT setval('user_roles_id_seq', COALESCE((SELECT MAX(id) FROM user_roles), 0) + 1, false);

-- 20. USER PREFERENCES
SELECT setval('user_preferences_id_seq', COALESCE((SELECT MAX(id) FROM user_preferences), 0) + 1, false);

-- 21. VENDOR AVAILABILITIES
SELECT setval('vendor_availabilities_id_seq', COALESCE((SELECT MAX(id) FROM vendor_availabilities), 0) + 1, false);

-- Verification Report
SELECT 
    'cart_items' as table_name,
    COALESCE((SELECT MAX(id) FROM cart_items), 0) as current_max_id,
    currval('cart_items_id_seq') as sequence_value
UNION ALL
SELECT 
    'users',
    COALESCE((SELECT MAX(id) FROM users), 0),
    currval('users_id_seq')
UNION ALL
SELECT 
    'services',
    COALESCE((SELECT MAX(id) FROM services), 0),
    currval('services_id_seq')
UNION ALL
SELECT 
    'bookings',
    COALESCE((SELECT MAX(id) FROM bookings), 0),
    currval('bookings_id_seq')
UNION ALL
SELECT 
    'reviews',
    COALESCE((SELECT MAX(id) FROM reviews), 0),
    currval('reviews_id_seq')
UNION ALL
SELECT 
    'payments',
    COALESCE((SELECT MAX(id) FROM payments), 0),
    currval('payments_id_seq')
UNION ALL
SELECT 
    'categories',
    COALESCE((SELECT MAX(id) FROM categories), 0),
    currval('categories_id_seq')
UNION ALL
SELECT 
    'vendors',
    COALESCE((SELECT MAX(id) FROM vendors), 0),
    currval('vendors_id_seq');

-- Success message
SELECT 'All sequences have been reset successfully!' as status;
