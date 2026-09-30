# Microservice Identification & Architecture Decomposition

**System**: BuildAsset Logistics Enterprise Platform  
**Architecture Pattern**: Domain-Driven Microservices with Database-per-Service / Schema-per-Service Isolation

---

## Architecture Overview Diagram

```
                                    +-----------------------------------------+
                                    |         Netflix Eureka Server           |
                                    |              (Port 8761)                |
                                    +--------------------+--------------------+
                                                         ^
                                                         | Service Registration & Discovery
                                                         v
                                    +-----------------------------------------+
                                    |          Spring Cloud Gateway           |
                                    |              (Port 8080)                |
                                    +--------------------+--------------------+
                                                         |
         +--------------------+--------------------------+--------------------------+--------------------+
         |                    |                          |                          |                    |
         v                    v                          v                          v                    v
+-----------------+  +-----------------+        +-----------------+        +-----------------+  +-----------------+
|  AUTH-SERVICE   |  |CONTRACTOR-SERV  |        | EQUIPMENT-SERV  |        |  RENTAL-SERVICE |  | DISPATCH-SERVICE|
|   (Port 8085)   |  |   (Port 8081)   |        |   (Port 8082)   |        |   (Port 8083)   |  |   (Port 8084)   |
+--------+--------+  +--------+--------+        +--------+--------+        +--------+--------+  +--------+--------+
         |                    |                          |                          |                    |
         v                    v                          v                          v                    v
 [ auth_schema ]     [contractor_schema]        [equipment_schema]          [ rental_schema ]   [ dispatch_schema ]
```

---

## Microservices Breakdown

### 1. Auth Service (`AUTH-SERVICE` :8085)
- **Primary Responsibility**: Identity verification, user credential storage, password hashing (BCrypt), stateless JWT token minting, token verification.
- **REST Endpoints**:
  - `POST /api/auth/register` — Contractor registration & account onboarding.
  - `POST /api/auth/login` — Authentication & JWT generation.
  - `GET /api/auth/validate` — Token validity check & claim decoding.
- **Database Ownership**: `auth_schema` (`users`, `roles`).
- **Dependencies**: Spring Security 6, JJWT 0.12.5, PostgreSQL Driver, Eureka Client.

---

### 2. Contractor Service (`CONTRACTOR-SERVICE` :8081)
- **Primary Responsibility**: Management of contractor corporate entities, contact persons, phone numbers, site addresses, and licensing status.
- **REST Endpoints**:
  - `GET /api/contractors` — Retrieve list of contractors with optional search filter.
  - `GET /api/contractors/{id}` — Retrieve contractor profile by ID.
  - `GET /api/contractors/username/{username}` — Lookup by username.
  - `POST /api/contractors` — Create new contractor profile.
  - `PUT /api/contractors/{id}` — Update contractor profile.
  - `DELETE /api/contractors/{id}` — Remove contractor.
- **Database Ownership**: `contractor_schema` (`contractors`).
- **Dependencies**: Spring Boot Data JPA, PostgreSQL Driver, Eureka Client, OpenAPI Swagger.

---

### 3. Equipment Service (`EQUIPMENT-SERVICE` :8082)
- **Primary Responsibility**: Fleet machinery inventory, technical specifications, multi-criteria search filtering, preventative maintenance schedules, and machinery status lifecycle management.
- **REST Endpoints**:
  - `GET /api/equipment` — Filter fleet by category, status, location, keyword.
  - `GET /api/equipment/{id}` — Fetch machine specifications by ID.
  - `GET /api/equipment/code/{code}` — Fetch by unique equipment code.
  - `POST /api/equipment` — Register new machinery in the fleet.
  - `PUT /api/equipment/{id}` — Modify equipment asset details.
  - `DELETE /api/equipment/{id}` — Delete equipment asset.
  - `PATCH /api/equipment/{id}/status` — Transition machine status (`AVAILABLE`, `RESERVED`, `DISPATCHED`, `IN_USE`, `RETURNED`, `MAINTENANCE`).
  - `GET /api/equipment/stats` — Aggregate counts grouped by status.
  - `POST /api/equipment/{id}/maintenance` — Schedule maintenance work order.
  - `GET /api/equipment/{id}/maintenance` — Retrieve service history logs.
  - `PATCH /api/equipment/maintenance/{logId}/status` — Update maintenance status (`SCHEDULED`, `IN_PROGRESS`, `COMPLETED`).
- **Database Ownership**: `equipment_schema` (`equipment`, `maintenance_logs`).
- **Dependencies**: Spring Data JPA, PostgreSQL Driver, Eureka Client, OpenAPI Swagger.

---

### 4. Rental Service (`RENTAL-SERVICE` :8083)
- **Primary Responsibility**: Machinery booking contracts, server-side rental duration calculation (`ChronoUnit.DAYS`), dynamic rate multiplication, equipment reservation locking, and conflicting schedule validation.
- **REST Endpoints**:
  - `GET /api/rentals` — Retrieve rental bookings with contractor/status filters.
  - `GET /api/rentals/{id}` — Fetch single rental booking details.
  - `POST /api/rentals/calculate` — Dynamic server-side rate quotation engine.
  - `POST /api/rentals` — Create confirmed booking and lock equipment to `RESERVED`.
  - `PUT /api/rentals/{id}` — Update rental dates or project notes.
  - `PATCH /api/rentals/{id}/status` — Update booking status (`CONFIRMED`, `ACTIVE`, `COMPLETED`, `CANCELLED`).
  - `DELETE /api/rentals/{id}` — Cancel booking and release equipment to `AVAILABLE`.
- **Database Ownership**: `rental_schema` (`rentals`).
- **Inter-Service Dependencies**: Communicates with `EQUIPMENT-SERVICE` to verify availability and daily rates.

---

### 5. Dispatch Service (`DISPATCH-SERVICE` :8084)
- **Primary Responsibility**: Job-site equipment haulage logistics, carrier coordination, operator assignment, multi-stage lifecycle progression, and automated equipment status synchronization.
- **REST Endpoints**:
  - `GET /api/dispatch` — Retrieve dispatches with status/contractor filters.
  - `GET /api/dispatch/{id}` — Fetch single dispatch details.
  - `POST /api/dispatch` — Create job-site dispatch schedule.
  - `PUT /api/dispatch/{id}` — Update haulage details.
  - `PATCH /api/dispatch/{id}/status` — Advance lifecycle (`PLANNED` → `DISPATCHED` → `IN_TRANSIT` → `ARRIVED` → `IN_USE` → `RETURNED`).
  - `GET /api/dispatch/{id}/history` — Audit trail timeline of transit milestones.
  - `GET /api/dispatch/stats` — Aggregate logistics status metrics.
- **Database Ownership**: `dispatch_schema` (`dispatches`, `dispatch_status_history`).
- **Inter-Service Dependencies**: Communicates with `EQUIPMENT-SERVICE` to synchronize machinery status upon transit events.

---

## 6. Service Discovery via Netflix Eureka
- **Eureka Server Port**: `8761`.
- **Mechanism**: Each microservice registers its metadata and network location upon boot using `@EnableDiscoveryClient`.
- **Health Checks & Heartbeats**: Microservices send periodic heartbeats (every 30 seconds) to renew their leases.
- **Decoupled Resolution**: Downstream clients (e.g. `api-gateway` and inter-service `RestTemplate`) reference logical service names (`lb://EQUIPMENT-SERVICE`) rather than hard-coded IP addresses, enabling zero-downtime horizontal scaling and load balancing.
