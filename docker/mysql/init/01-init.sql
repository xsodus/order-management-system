-- Initialize Order Management Database
-- This script runs when the MySQL container starts for the first time

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS order_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create a dedicated user for the application (optional, using root for simplicity)
-- CREATE USER IF NOT EXISTS 'order_user'@'%' IDENTIFIED BY 'order-management';
-- GRANT ALL PRIVILEGES ON order_management_db.* TO 'order_user'@'%';
-- FLUSH PRIVILEGES;

-- Use the database
USE order_management_db;

-- Enable performance schema for better monitoring (optional)
SET GLOBAL performance_schema = ON;
