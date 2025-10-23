-- Add time slot columns to services table
-- Run this SQL script in PostgreSQL to add the new columns

ALTER TABLE services 
ADD COLUMN IF NOT EXISTS available_from_time TIME,
ADD COLUMN IF NOT EXISTS available_to_time TIME;

-- Update existing services with default time slots (9 AM to 6 PM)
UPDATE services 
SET available_from_time = '09:00:00',
    available_to_time = '18:00:00'
WHERE available_from_time IS NULL;

-- Verify the changes
SELECT id, service_name, available_from_time, available_to_time 
FROM services 
LIMIT 5;
