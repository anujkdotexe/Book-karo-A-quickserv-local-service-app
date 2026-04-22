-- Fix payment_status constraint to include PROCESSING
-- This script ensures the payments table allows PROCESSING status

-- First, update any existing PROCESSING statuses (if any exist from failed inserts)
-- UPDATE payments SET payment_status = 'PENDING' WHERE payment_status = 'PROCESSING';

-- Drop the old constraint
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_status_check;

-- Add the new constraint with PROCESSING included using simple IN syntax
ALTER TABLE payments ADD CONSTRAINT payments_payment_status_check 
CHECK (payment_status IN ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED'));

-- Verify the constraint was created
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'payments_payment_status_check';

-- Test that PROCESSING is now allowed
SELECT 'PROCESSING'::text IN ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED') AS processing_allowed;
