-- Alternative: Run this directly in pgAdmin or any PostgreSQL client
-- This includes all the setup in one file

-- Create system_settings table
DROP TABLE IF EXISTS system_settings CASCADE;

CREATE TABLE system_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'TEXT',
    description TEXT,
    category VARCHAR(50),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_setting_key ON system_settings(setting_key);
CREATE INDEX idx_category ON system_settings(category);
CREATE INDEX idx_is_public ON system_settings(is_public);

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, category, is_public) 
VALUES 
    ('contact.email', 'support@bookkaro.com', 'EMAIL', 'Support email address', 'CONTACT', true),
    ('contact.phone', '+1 (555) 123-4567', 'PHONE', 'Support phone number', 'CONTACT', true),
    ('pricing.service_fee', '99', 'NUMBER', 'Service fee per booking (in rupees)', 'PRICING', false),
    ('general.platform_name', 'BOOK-KARO', 'TEXT', 'Platform name', 'GENERAL', true);

-- Verify insertion
SELECT 
    id,
    setting_key,
    setting_value,
    setting_type,
    category,
    is_public,
    created_at
FROM system_settings
ORDER BY category, setting_key;

-- Show count
SELECT COUNT(*) as total_settings FROM system_settings;

COMMENT ON TABLE system_settings IS 'Stores configurable system settings for the application';
