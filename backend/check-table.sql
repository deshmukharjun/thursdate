-- Check current table structure
DESCRIBE users;

-- Add missing columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS intent TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE;

-- Verify the table structure again
DESCRIBE users; 