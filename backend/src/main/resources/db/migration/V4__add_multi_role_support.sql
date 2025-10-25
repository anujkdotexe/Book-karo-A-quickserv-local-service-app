-- Migration: Add Multi-Role Support
-- Date: 2025-10-25
-- Purpose: Allow users to have multiple roles (e.g., USER + VENDOR simultaneously)

-- Create user_roles junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Migrate existing single-role data to the new table
INSERT INTO user_roles (user_id, role)
SELECT id, role::VARCHAR
FROM users
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Add comment for documentation
COMMENT ON TABLE user_roles IS 'Stores user roles - allows users to have multiple roles (USER, VENDOR, ADMIN)';
COMMENT ON COLUMN user_roles.user_id IS 'Foreign key to users table';
COMMENT ON COLUMN user_roles.role IS 'User role: USER, VENDOR, or ADMIN';
