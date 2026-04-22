-- Fix cart_items sequence to prevent duplicate key violations
-- This resets the sequence to the maximum ID + 1

-- Reset cart_items sequence
SELECT setval('cart_items_id_seq', COALESCE((SELECT MAX(id) FROM cart_items), 0) + 1, false);

-- Verify the fix
SELECT 
    'cart_items' as table_name,
    COALESCE((SELECT MAX(id) FROM cart_items), 0) as max_id,
    nextval('cart_items_id_seq') as next_sequence_value;

-- Reset sequence back one step after verification
SELECT setval('cart_items_id_seq', COALESCE((SELECT MAX(id) FROM cart_items), 0) + 1, false);

-- Optional: Clean up any orphaned cart items (uncomment if needed)
-- DELETE FROM cart_items WHERE user_id NOT IN (SELECT id FROM users);
-- DELETE FROM cart_items WHERE service_id NOT IN (SELECT id FROM services);
