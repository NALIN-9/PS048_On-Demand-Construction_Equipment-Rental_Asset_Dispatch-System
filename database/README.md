# BuildAsset Logistics - PostgreSQL Database Guide

This document details the PostgreSQL database architecture, schema isolation per microservice, and step-by-step setup for **BuildAsset Logistics**.

---

## 1. Clean Database Architecture: Schema-per-Service Isolation

In BuildAsset Logistics, all microservices connect to PostgreSQL (`buildasset_db`). Each microservice strictly owns its isolated PostgreSQL schema:

| Microservice | Port | Schema | Domain Tables | Description | Initial Count |
|---|---|---|---|---|---|
| **Auth Service** | 8085 | `auth_schema` | `roles`, `users` | Roles and registered user accounts. | **0 Users** |
| **Contractor Service** | 8081 | `contractor_schema` | `contractors` | Contractor corporate profiles. | **0 Contractors** |
| **Equipment Service** | 8082 | `equipment_schema` | `equipment`, `maintenance_logs` | Fleet machinery inventory. | **0 Equipment** |
| **Rental Service** | 8083 | `rental_schema` | `rentals` | Rental bookings and calculations. | **0 Rentals** |
| **Dispatch Service** | 8084 | `dispatch_schema` | `dispatches`, `dispatch_status_history` | Job-site dispatches & transit log. | **0 Dispatches** |

---

## 2. Prerequisites & Credentials

- **PostgreSQL 14+ / 17+ / 18+**
- **Host**: `localhost`
- **Port**: `5432` / `5433` (configurable via `DB_PORT` or `SPRING_DATASOURCE_URL`)
- **Database**: `buildasset_db`
- **Username**: `postgres`
- **Password**: `root`

---

## 3. Database Initialization

### Step 1: Create Database
```bash
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE buildasset_db;"
```

### Step 2: Apply Schemas and Base Configuration
```bash
psql -U postgres -h localhost -p 5432 -d buildasset_db -f database/schema.sql
psql -U postgres -h localhost -p 5432 -d buildasset_db -f database/seed.sql
```

---

## 4. Verification

Verify that all business tables start completely clean with 0 records:
```sql
SELECT 'auth_schema.users' as table, count(*) FROM auth_schema.users
UNION ALL
SELECT 'contractor_schema.contractors', count(*) FROM contractor_schema.contractors
UNION ALL
SELECT 'equipment_schema.equipment', count(*) FROM equipment_schema.equipment
UNION ALL
SELECT 'rental_schema.rentals', count(*) FROM rental_schema.rentals
UNION ALL
SELECT 'dispatch_schema.dispatches', count(*) FROM dispatch_schema.dispatches;
```
All counts return **0**. All user, contractor, equipment, rental, and dispatch records are created through the live application.
