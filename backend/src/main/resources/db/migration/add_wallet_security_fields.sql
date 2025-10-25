-- Migration: Add wallet security fields for fraud prevention
-- Date: 2025-10-25
-- Purpose: Implement daily top-up limits and tracking to prevent fraud

-- Add daily top-up tracking columns to wallets table
ALTER TABLE wallets 
ADD COLUMN IF NOT EXISTS daily_topup_total DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS last_topup_date TIMESTAMP;

-- Add comment for documentation
COMMENT ON COLUMN wallets.daily_topup_total IS 'Total amount topped up today for daily limit enforcement (₹1,00,000/day)';
COMMENT ON COLUMN wallets.last_topup_date IS 'Last top-up timestamp to track daily limit reset';

-- Initialize existing wallets with default values
UPDATE wallets 
SET daily_topup_total = 0.00,
    last_topup_date = NULL
WHERE daily_topup_total IS NULL;
