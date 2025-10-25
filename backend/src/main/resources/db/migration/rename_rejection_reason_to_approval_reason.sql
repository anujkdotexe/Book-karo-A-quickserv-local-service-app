-- Migration: Rename rejection_reason to approval_reason for better semantics
-- Date: 2025-10-25
-- Purpose: Store admin feedback for all status changes (approval/rejection/suspension)

-- Rename column in vendors table
ALTER TABLE vendors 
RENAME COLUMN rejection_reason TO approval_reason;

-- Rename column in services table
ALTER TABLE services 
RENAME COLUMN rejection_reason TO approval_reason;

-- Add comments for documentation
COMMENT ON COLUMN vendors.approval_reason IS 'Admin feedback explaining approval, rejection, or suspension decision';
COMMENT ON COLUMN services.approval_reason IS 'Admin feedback explaining approval or rejection decision';
