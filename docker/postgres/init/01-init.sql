-- PostgreSQL Initialization Script for Order Management System
-- This script is executed when the PostgreSQL container starts for the first time

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- The database and user are already created by the environment variables
-- POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD

-- Set timezone to UTC
SET timezone = 'UTC';

-- Ensure the database uses UTF8 encoding
-- (This is already the default for PostgreSQL, but we'll be explicit)
