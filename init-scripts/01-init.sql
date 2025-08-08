-- Casino Tracker Database Initialization Script
-- This script runs when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist
-- (PostgreSQL creates the database automatically from environment variables)

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- You can add any additional initialization here
-- For example, creating specific schemas, users, or initial data

-- Example: Create a schema for the application
-- CREATE SCHEMA IF NOT EXISTS casino_tracker;

-- Example: Grant permissions
-- GRANT ALL PRIVILEGES ON SCHEMA casino_tracker TO casino_user;
