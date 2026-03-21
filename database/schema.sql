-- Create database if not exists
-- Run manually: CREATE DATABASE workshop_db;

-- 1. RECEIPTS Table Setup
CREATE TABLE IF NOT EXISTS receipts (
    id SERIAL PRIMARY KEY,
    receipt_no VARCHAR(50) UNIQUE NOT NULL,
    receipt_date DATE NOT NULL,
    customer_name VARCHAR(100),
    description TEXT,
    amount NUMERIC(10,2) NOT NULL,
    payment_mode VARCHAR(50),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure all columns exist for receipts
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS receipt_no VARCHAR(50);
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS receipt_date DATE;
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS customer_name VARCHAR(100);
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS amount NUMERIC(10,2);
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS payment_mode VARCHAR(50);
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS status VARCHAR(50);
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. JOBCARDS Table Setup
CREATE TABLE IF NOT EXISTS jobcards (
    id SERIAL PRIMARY KEY,
    jobcard_no VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    vehicle_no VARCHAR(30),
    vehicle_type VARCHAR(50),
    brand VARCHAR(50),
    model VARCHAR(100),
    service_type VARCHAR(100),
    complaint TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    estimated_amount NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure all columns exist for jobcards
ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS jobcard_no VARCHAR(50);
ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS customer_name VARCHAR(100);
ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS vehicle_no VARCHAR(30);
ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(50);
ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS brand VARCHAR(50);
ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS model VARCHAR(100);
ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS service_type VARCHAR(100);
ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS complaint TEXT;
ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS estimated_amount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 3. USERS Table Setup
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo users (using plain text passwords for this demo/test as per requirements)
-- WARNING: In production, always use hashed passwords!
INSERT INTO users (username, email, password, role)
VALUES 
('admin', 'admin@kkenterprises.com', 'admin123', 'admin'),
('user', 'user@kkenterprises.com', 'user123', 'user'),
('staff1', 'staff1@kkenterprises.com', '123456', 'user')
ON CONFLICT (email) DO NOTHING;

-- 4. CUSTOMERS Table Setup
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    customer_code VARCHAR(30) UNIQUE,
    customer_name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    alternate_phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    gst_no VARCHAR(50),
    opening_balance NUMERIC(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TRANSPORTS Table Setup
CREATE TABLE IF NOT EXISTS transports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    gst_no VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. RECEIPTS Table Setup (Updated)
CREATE TABLE IF NOT EXISTS receipts (
    id SERIAL PRIMARY KEY,
    receipt_no VARCHAR(50) UNIQUE NOT NULL,
    receipt_date DATE NOT NULL,
    customer_name VARCHAR(100),
    customer_phone VARCHAR(20),
    labour_bill_id VARCHAR(50),
    labour_bill_no VARCHAR(50),
    description TEXT,
    amount NUMERIC(10,2) NOT NULL,
    payment_mode VARCHAR(50),
    reference_no VARCHAR(100),
    bank_name VARCHAR(100),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. JOBCARDS Table Setup (Updated)
CREATE TABLE IF NOT EXISTS jobcards (
    id SERIAL PRIMARY KEY,
    jobcard_no VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    vehicle_no VARCHAR(30),
    vehicle_type VARCHAR(50),
    brand VARCHAR(50),
    model VARCHAR(100),
    transport_name VARCHAR(255),
    km_reading VARCHAR(50),
    service_type VARCHAR(100),
    work_type VARCHAR(100),
    technician_id VARCHAR(50),
    technician_name VARCHAR(100),
    before_front_camber VARCHAR(50),
    before_front_caster VARCHAR(50),
    before_front_toe VARCHAR(50),
    before_rear_camber VARCHAR(50),
    before_rear_toe VARCHAR(50),
    after_front_camber VARCHAR(50),
    after_front_caster VARCHAR(50),
    after_front_toe VARCHAR(50),
    after_rear_camber VARCHAR(50),
    after_rear_toe VARCHAR(50),
    service_items JSONB,
    complaint TEXT,
    work_done TEXT,
    remarks TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    labour_charge NUMERIC(10,2) DEFAULT 0,
    parts_charge NUMERIC(10,2) DEFAULT 0,
    estimated_amount NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. PAYMENTS Table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    receipt_id INT,
    amount NUMERIC(10,2),
    payment_date DATE,
    payment_mode VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for testing
INSERT INTO users (username, email, password, role)
VALUES 
('admin', 'admin@kkenterprises.com', 'admin123', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO customers (customer_code, customer_name, phone, email, status)
VALUES 
('CUST001', 'Test Customer', '9876543210', 'test@example.com', 'active')
ON CONFLICT (customer_code) DO NOTHING;

INSERT INTO transports (name, contact_person, phone)
VALUES 
('Fast Logistics', 'John Doe', '9123456789')
ON CONFLICT DO NOTHING;
