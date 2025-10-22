-- Migration: Rename zip_code to postal_code in users table
-- Date: 2025-10-22
-- Description: Standardize field naming across all entities (User, Vendor, Service, Address)

-- Step 1: Rename column in users table
ALTER TABLE users 
RENAME COLUMN zip_code TO postal_code;

-- Step 2: Update any existing NULL values to empty string (if needed)
UPDATE users 
SET postal_code = '' 
WHERE postal_code IS NULL;

-- Verification Query:
-- SELECT id, email, postal_code FROM users LIMIT 5;
