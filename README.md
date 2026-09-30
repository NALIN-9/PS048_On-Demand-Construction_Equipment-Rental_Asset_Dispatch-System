# BUILDASSET LOGISTICS — Enterprise Heavy Machinery Rental & Dispatch Platform

[![Java](https://img.shields.io/badge/Java-17%2B-ED8B00?style=flat&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?style=flat&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Cloud](https://img.shields.io/badge/Spring%20Cloud-2023.0.1-6DB33F?style=flat&logo=spring&logoColor=white)](https://spring.io/projects/spring-cloud)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Proprietary-slate.svg)]()

> **BuildAsset Logistics** is an enterprise-grade cloud-native microservices platform for heavy equipment rental management, server-side dynamic lease pricing, job-site haulage dispatch, and fleet preventative maintenance.

---

## 1. System Architecture

```
                                  +---------------------------------------+
                                  |         Netflix Eureka Server         |
                                  |              (Port 8761)              |
                                  +-------------------+-------------------+
                                                      ^
                                                      | Registration & Discovery
                                                      v
                                  +---------------------------------------+
                                  |         Spring Cloud Gateway          |
                                  |              (Port 8080)              |
                                  +-------------------+-------------------+
                                                      |
         +--------------------+-----------------------+-----------------------+--------------------+
         |                    |                       |                       |                    |
         v                    v                       v                       v                    v
+-----------------+  +-----------------+     +-----------------+     +-----------------+  +-----------------+
|  AUTH-SERVICE   |  |CONTRACTOR-SERV  |     | EQUIPMENT-SERV  |     |  RENTAL-SERVICE |  | DISPATCH-SERVICE|
|   (Port 8085)   |  |   (Port 8081)   |     |   (Port 8082)   |     |   (Port 8083)   |  |   (Port 8084)   |
+--------+--------+  +--------+--------+     +--------+--------+     +--------+--------+  +--------+--------+
         |                    |                       |                       |                    |
         v                    v                       v                       v                    v
 [ auth_schema ]     [contractor_schema]     [equipment_schema]       [ rental_schema ]   [ dispatch_schema ]
```

### Infrastructure Layer
- **Eureka Server** (`:8761`): Centralized microservices registration, dynamic resolution, health heartbeats.
- **API Gateway** (`:8080`): Spring Cloud Gateway reverse proxy, `lb://` dynamic routing, global JWT filter, and CORS for `http://localhost:5173`.

### Business Microservices Layer (5 Core Services)
- **Auth Service** (`:8085`): User onboarding, BCrypt password hashing, stateless JWT issue/validate.
- **Contractor Service** (`:8081`): Corporate profiles, tax/licensing, site supervisor contacts.
- **Equipment Service** (`:8082`): Fleet inventory catalog, search filtering, maintenance work orders.
- **Rental Service** (`:8083`): Server-authoritative duration (`ChronoUnit.DAYS`) & rate pricing, reservation locking (`RESERVED`).
- **Dispatch Service** (`:8084`): Haulage tracking, multi-stage pipeline, automated equipment status sync.

---

## 2. Port Allocation Table

| Component | Port | Description | Health / UI URL |
|---|---|---|---|
| **Eureka Server** | `8761` | Service Discovery & Registry | `http://localhost:8761` |
| **API Gateway** | `8080` | Central Entrypoint & Reverse Proxy | `http://localhost:8080` |
| **Auth Service** | `8085` | Authentication & JWT Issuance | `http://localhost:8085/swagger-ui.html` |
| **Contractor Service** | `8081` | Contractor Profile Directory | `http://localhost:8081/swagger-ui.html` |
| **Equipment Service** | `8082` | Fleet Catalog & Maintenance | `http://localhost:8082/swagger-ui.html` |
| **Rental Service** | `8083` | Rate Calculation & Reservations | `http://localhost:8083/swagger-ui.html` |
| **Dispatch Service** | `8084` | Job-Site Dispatch Logistics | `http://localhost:8084/swagger-ui.html` |
| **React Frontend** | `5173` | Vite Single Page Application | `http://localhost:5173` |

---

## 3. Project Directory Structure

```
equipment_project/
├── backend/
│   ├── api-gateway/            # Port 8080: Spring Cloud Gateway & JWT Filter
│   ├── auth-service/           # Port 8085: User Auth, BCrypt, JWT
│   ├── contractor-service/     # Port 8081: Contractor Corporate Profiles
│   ├── dispatch-service/       # Port 8084: Haulage & Status Synchronization
│   ├── equipment-service/      # Port 8082: Machinery Fleet & Maintenance Logs
│   ├── eureka-server/          # Port 8761: Netflix Eureka Registry
│   ├── rental-service/         # Port 8083: Server-Side Rate Engine & Bookings
│   └── pom.xml                 # Root Maven Parent POM
│
├── frontend/
│   └── buildasset-react/       # Port 5173: React 19 + Vite + Tailwind CSS SPA
│
├── database/
│   ├── schema.sql              # Clean DDL: 5 isolated schemas & tables
│   ├── seed.sql                # Clean System Roles (ZERO demo business data)
│   └── README.md               # Database Architecture & pgAdmin Guide
│
├── documentation/
│   ├── empathy-map.md          # Empathy mapping based on contractor interviews
│   ├── persona.md              # Infrastructure contractor persona
│   ├── customer-journey-map.md # Multi-stage customer journey (Discovery to Return)
│   ├── problem-analysis.md     # Industrial problem statement & architectural blueprint
│   ├── requirements.md         # Requirements Traceability Matrix (RTM)
│   ├── microservice-identification.md # Domain boundaries & Eureka discovery
│   ├── jwt-authentication.md   # Cryptographic JWT & BCrypt workflow
│   ├── api-gateway.md          # Spring Cloud Gateway routing & CORS
│   └── linkedin-article.md     # Academic publication & architecture showcase
│
├── .env.example                # Safe environment variable template
└── README.md                   # Master Documentation
```

---

## 4. Prerequisites

- **Java Development Kit (JDK)**: OpenJDK 17 LTS or newer.
- **Node.js**: Node 18+ or 20+ with `npm`.
- **Build Tool**: Apache Maven 3.8+ (or bundled wrapper).
- **Database**: PostgreSQL 14+ / 17+ running on `localhost:5432`.
- **Database Management Tool**: pgAdmin 4 or `psql` CLI.

---

## 5. PostgreSQL Database Setup

### Step 1: Create Database
```bash
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE buildasset_db;"
```

### Step 2: Apply Schemas and Base Seed Configuration
```bash
psql -U postgres -h localhost -p 5432 -d buildasset_db -f database/schema.sql
psql -U postgres -h localhost -p 5432 -d buildasset_db -f database/seed.sql
```

> **Clean Data Guarantee**: `schema.sql` creates the 5 isolated schemas (`auth_schema`, `contractor_schema`, `equipment_schema`, `rental_schema`, `dispatch_schema`). `seed.sql` inserts only system role definitions. **Zero sample contractors, users, equipment, rentals, or dispatches are created**.

---

## 6. Environment Configuration

Copy `.env.example` to `.env` if custom environment configurations are required:

```bash
cp .env.example .env
```

Default connection settings:
```properties
DB_HOST=localhost
DB_PORT=5432
DB_NAME=buildasset_db
DB_USERNAME=postgres
DB_PASSWORD=root
JWT_SECRET=BuildAssetLogisticsSuperSecretKeyForJWTAuthentication2026Enterprise
```

---

## 7. Starting the Platform

### Option A: Running the Backend Microservices

Start services in the following order:

1. **Eureka Server** (Port 8761):
   ```powershell
   cd backend/eureka-server
   mvn spring-boot:run
   ```
2. **API Gateway** (Port 8080):
   ```powershell
   cd backend/api-gateway
   mvn spring-boot:run
   ```
3. **Auth Service** (Port 8085):
   ```powershell
   cd backend/auth-service
   mvn spring-boot:run
   ```
4. **Contractor Service** (Port 8081):
   ```powershell
   cd backend/contractor-service
   mvn spring-boot:run
   ```
5. **Equipment Service** (Port 8082):
   ```powershell
   cd backend/equipment-service
   mvn spring-boot:run
   ```
6. **Rental Service** (Port 8083):
   ```powershell
   cd backend/rental-service
   mvn spring-boot:run
   ```
7. **Dispatch Service** (Port 8084):
   ```powershell
   cd backend/dispatch-service
   mvn spring-boot:run
   ```

### Option B: Running the React Frontend

```powershell
cd frontend/buildasset-react
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 8. API Documentation (Swagger / OpenAPI)

Interactive Swagger UI is enabled on all 5 business microservices with **Authorize Bearer JWT** support:

1. **Auth Service**: `http://localhost:8085/swagger-ui.html`
2. **Contractor Service**: `http://localhost:8081/swagger-ui.html`
3. **Equipment Service**: `http://localhost:8082/swagger-ui.html`
4. **Rental Service**: `http://localhost:8083/swagger-ui.html`
5. **Dispatch Service**: `http://localhost:8084/swagger-ui.html`

---

## 9. Comprehensive Testing & Verification

### Run Backend Unit & Integration Tests
```powershell
cd backend
mvn clean test
```

### Verify Frontend Production Build
```powershell
cd frontend/buildasset-react
npm run build
```

---

## 10. End-to-End Business Flow Walkthrough

```
Sign Up (/signup)
   ↓ (POST /api/auth/register)
Sign In (/signin)
   ↓ (POST /api/auth/login → Receive JWT)
Authorize Session
   ↓
Create Contractor Profile (/contractors)
   ↓
Register Equipment (/equipment/add) [Status: AVAILABLE]
   ↓
Book Rental (/rentals/book)
   ↓ (Server calculates exact duration & totalAmount)
Equipment Status Automatically Locks → [Status: RESERVED]
   ↓
Schedule Job-Site Dispatch (/dispatch/create)
   ↓
Advance Pipeline: PLANNED → DISPATCHED [Equipment: DISPATCHED]
   ↓
Advance Pipeline: IN_TRANSIT → ARRIVED → IN_USE [Equipment: IN_USE]
   ↓
Complete Return: RETURNED [Equipment Resets: AVAILABLE]
   ↓
Schedule Preventative Maintenance (/equipment/:id) [Equipment: MAINTENANCE]
   ↓
Complete Service Log [Equipment Resets: AVAILABLE]
```
