-- Authentication Configuration Script
-- This script configures PostgreSQL to allow external connections with password authentication

-- Update pg_hba.conf to allow password authentication for external connections
-- Note: This is a simplified approach - in production, you might want more restrictive settings

-- The following lines should be added to pg_hba.conf (this is handled by the Docker image)
-- host    all             all             0.0.0.0/0               md5
-- host    all             all             ::/0                    md5

-- For now, we'll ensure the user has the correct password and permissions
ALTER USER casino_user WITH PASSWORD 'casino_password';

-- Grant necessary permissions
GRANT CONNECT ON DATABASE casino_tracker TO casino_user;
GRANT USAGE ON SCHEMA public TO casino_user;
GRANT CREATE ON SCHEMA public TO casino_user;
