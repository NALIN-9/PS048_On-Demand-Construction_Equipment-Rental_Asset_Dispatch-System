-- ====================================================================
-- BUILDASSET LOGISTICS - CLEAN SYSTEM SEED SCRIPT
-- Status: Clean Initial State (ZERO sample business records)
-- All contractors, equipment, rentals, dispatches, and users
-- must be created through the live application / REST APIs.
-- ====================================================================

-- Essential System Role Definitions (Non-business configuration only)
INSERT INTO auth_schema.roles (name, description) VALUES
('ROLE_ADMIN', 'Platform Administrator'),
('ROLE_CONTRACTOR', 'Registered Contractor'),
('ROLE_DISPATCHER', 'Logistics Dispatch Coordinator')
ON CONFLICT (name) DO NOTHING;

-- ZERO sample users
-- ZERO sample contractors
-- ZERO sample equipment
-- ZERO sample rentals
-- ZERO sample dispatches
-- ZERO sample maintenance records
