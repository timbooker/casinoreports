-- Casino Tracker Database Initialization Script
-- This script runs when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist
-- (PostgreSQL creates the database automatically from environment variables)

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant all privileges to casino_user on the database
GRANT ALL PRIVILEGES ON DATABASE casino_tracker TO casino_user;

-- Grant all privileges on all tables in the public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO casino_user;

-- Grant all privileges on all sequences in the public schema
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO casino_user;

-- Grant all privileges on the public schema itself
GRANT ALL PRIVILEGES ON SCHEMA public TO casino_user;

-- Grant usage on the public schema
GRANT USAGE ON SCHEMA public TO casino_user;

-- Set default privileges for future tables and sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO casino_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO casino_user;

-- Ensure the user can connect from any host
ALTER USER casino_user WITH PASSWORD 'casino_password';
