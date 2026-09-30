-- ====================================================================
-- BUILDASSET LOGISTICS - CLEAN ENTERPRISE POSTGRESQL DDL
-- Target DBMS: PostgreSQL 14+ / 17+ / 18+
-- Architecture: Database Schema-per-Service Isolation
-- Clean Starting State: ZERO business records
-- ====================================================================

-- 1. Create Distinct Isolated Service Schemas
CREATE SCHEMA IF NOT EXISTS auth_schema;
CREATE SCHEMA IF NOT EXISTS contractor_schema;
CREATE SCHEMA IF NOT EXISTS equipment_schema;
CREATE SCHEMA IF NOT EXISTS rental_schema;
CREATE SCHEMA IF NOT EXISTS dispatch_schema;

-- ====================================================================
-- SCHEMA 1: AUTH SERVICE (Port 8085)
-- ====================================================================

CREATE TABLE IF NOT EXISTS auth_schema.roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS auth_schema.users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_CONTRACTOR',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON auth_schema.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON auth_schema.users(email);

-- ====================================================================
-- SCHEMA 2: CONTRACTOR SERVICE (Port 8081)
-- ====================================================================

CREATE TABLE IF NOT EXISTS contractor_schema.contractors (
    id BIGSERIAL PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(25) NOT NULL,
    address TEXT NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_CONTRACTOR',
    business_license_number VARCHAR(100),
    tax_id VARCHAR(50),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contractors_email ON contractor_schema.contractors(email);
CREATE INDEX IF NOT EXISTS idx_contractors_username ON contractor_schema.contractors(username);

-- ====================================================================
-- SCHEMA 3: EQUIPMENT SERVICE (Port 8082)
-- ====================================================================

CREATE TABLE IF NOT EXISTS equipment_schema.equipment (
    id BIGSERIAL PRIMARY KEY,
    equipment_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(80) NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year_of_manufacture INT NOT NULL,
    daily_rate NUMERIC(12, 2) NOT NULL CHECK (daily_rate > 0),
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    location VARCHAR(150) NOT NULL,
    image_url VARCHAR(500),
    description TEXT,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment_schema.equipment(category);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment_schema.equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_location ON equipment_schema.equipment(location);
CREATE INDEX IF NOT EXISTS idx_equipment_code ON equipment_schema.equipment(equipment_code);

CREATE TABLE IF NOT EXISTS equipment_schema.maintenance_logs (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT NOT NULL REFERENCES equipment_schema.equipment(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(100) NOT NULL,
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    cost NUMERIC(12, 2) DEFAULT 0.00,
    technician_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_maintenance_equipment_id ON equipment_schema.maintenance_logs(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON equipment_schema.maintenance_logs(status);

-- ====================================================================
-- SCHEMA 4: RENTAL SERVICE (Port 8083)
-- ====================================================================

CREATE TABLE IF NOT EXISTS rental_schema.rentals (
    id BIGSERIAL PRIMARY KEY,
    contractor_id BIGINT NOT NULL,
    equipment_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_days INT NOT NULL CHECK (duration_days > 0),
    daily_rate NUMERIC(12, 2) NOT NULL CHECK (daily_rate > 0),
    total_amount NUMERIC(14, 2) NOT NULL CHECK (total_amount > 0),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    booking_reference VARCHAR(64) UNIQUE NOT NULL,
    delivery_address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rentals_contractor ON rental_schema.rentals(contractor_id);
CREATE INDEX IF NOT EXISTS idx_rentals_equipment ON rental_schema.rentals(equipment_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rental_schema.rentals(status);
CREATE INDEX IF NOT EXISTS idx_rentals_dates ON rental_schema.rentals(start_date, end_date);

-- ====================================================================
-- SCHEMA 5: DISPATCH SERVICE (Port 8084)
-- ====================================================================

CREATE TABLE IF NOT EXISTS dispatch_schema.dispatches (
    id BIGSERIAL PRIMARY KEY,
    rental_id BIGINT NOT NULL,
    equipment_id BIGINT NOT NULL,
    contractor_id BIGINT NOT NULL,
    job_site VARCHAR(255) NOT NULL,
    dispatch_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expected_return_date TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_return_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(30) NOT NULL DEFAULT 'PLANNED',
    carrier_name VARCHAR(100),
    operator_name VARCHAR(100),
    site_contact_phone VARCHAR(25),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dispatch_rental ON dispatch_schema.dispatches(rental_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_equipment ON dispatch_schema.dispatches(equipment_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_contractor ON dispatch_schema.dispatches(contractor_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_status ON dispatch_schema.dispatches(status);

CREATE TABLE IF NOT EXISTS dispatch_schema.dispatch_status_history (
    id BIGSERIAL PRIMARY KEY,
    dispatch_id BIGINT NOT NULL REFERENCES dispatch_schema.dispatches(id) ON DELETE CASCADE,
    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    change_reason VARCHAR(255),
    changed_by VARCHAR(50),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_history_dispatch_id ON dispatch_schema.dispatch_status_history(dispatch_id);
