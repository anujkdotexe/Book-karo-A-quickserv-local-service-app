-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
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

-- Create index on setting_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_setting_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_is_public ON system_settings(is_public);

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, category, is_public) 
VALUES 
    ('contact.email', 'support@bookkaro.com', 'EMAIL', 'Support email address', 'CONTACT', true),
    ('contact.phone', '+1 (555) 123-4567', 'PHONE', 'Support phone number', 'CONTACT', true),
    ('pricing.service_fee', '99', 'NUMBER', 'Service fee per booking (in rupees)', 'PRICING', false),
    ('general.platform_name', 'BOOK-KARO', 'TEXT', 'Platform name', 'GENERAL', true)
ON CONFLICT (setting_key) DO NOTHING;

-- Add comment to table
COMMENT ON TABLE system_settings IS 'Stores configurable system settings for the application';
