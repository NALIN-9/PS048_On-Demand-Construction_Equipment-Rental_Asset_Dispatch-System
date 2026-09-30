# Requirements Specification & Traceability Matrix (RTM)

**Project**: BuildAsset Logistics — Enterprise Heavy Equipment Rental & Dispatch Platform  
**Standard**: IEEE 830 / ISO 29148 Compliant Specification

---

## 1. Requirements Traceability Matrix (RTM)

| Requirement ID | Category | Requirement Description | Implementing Microservice / Component | Associated Endpoints | Test Verification Case | Status |
|---|---|---|---|---|---|---|
| **REQ-AUTH-01** | Authentication | Contractor Registration with BCrypt hashing and email/username duplication checks | `auth-service` (Port 8085) | `POST /api/auth/register` | `AuthServiceTest.testRegisterSuccess`, `testRegisterDuplicateUsernameThrows` | **VERIFIED** |
| **REQ-AUTH-02** | Authentication | Credential validation and stateless JWT token issuance | `auth-service` (Port 8085) | `POST /api/auth/login` | `AuthServiceTest.testLoginSuccessWithUsername`, `testLoginInvalidPasswordThrows` | **VERIFIED** |
| **REQ-AUTH-03** | Security | Stateless JWT token cryptographic validation & claim resolution | `auth-service` & `api-gateway` | `GET /api/auth/validate` | `AuthServiceTest.testValidateTokenValid`, `testJwtExpiration` | **VERIFIED** |
| **REQ-CONT-01** | Contractor | Complete CRUD profile management for contractor corporate entities | `contractor-service` (Port 8081) | `GET, POST, PUT, DELETE /api/contractors` | `ContractorServiceTest.testCreateContractor`, `testGetAllContractors` | **VERIFIED** |
| **REQ-EQP-01** | Equipment | Heavy machinery cataloging with unique equipment code and technical specifications | `equipment-service` (Port 8082) | `GET, POST, PUT, DELETE /api/equipment` | `EquipmentServiceTest.testCreateEquipmentSuccess`, `testDeleteEquipmentSuccess` | **VERIFIED** |
| **REQ-EQP-02** | Equipment | Dynamic search & filtering by Category, Status, Yard Location, and Keywords | `equipment-service` (Port 8082) | `GET /api/equipment` | `EquipmentServiceTest.testGetAllEquipmentEmptyInitially` | **VERIFIED** |
| **REQ-EQP-03** | Maintenance | Preventive maintenance scheduling and automated status transition (`AVAILABLE` → `MAINTENANCE` → `AVAILABLE`) | `equipment-service` (Port 8082) | `POST /api/equipment/{id}/maintenance`, `PATCH /api/equipment/maintenance/{id}/status` | `EquipmentServiceTest.testScheduleMaintenanceSetsEquipmentMaintenanceStatus`, `testCompleteMaintenanceSetsEquipmentAvailable` | **VERIFIED** |
| **REQ-RNT-01** | Rental | Server-side rental duration calculation using `ChronoUnit.DAYS.between(start, end)` | `rental-service` (Port 8083) | `POST /api/rentals/calculate` | `RentalServiceTest.testDurationCalculationExactDays`, `testDurationCalculationSameDayIsOneDay` | **VERIFIED** |
| **REQ-RNT-02** | Rental | Server-side total rate calculation (`duration × dailyRate`) with official Equipment Service daily rate | `rental-service` (Port 8083) | `POST /api/rentals/calculate` | `RentalServiceTest.testRentalCalculationTotalAmountFormula` | **VERIFIED** |
| **REQ-RNT-03** | Rental | Conflict validation, unavailable equipment rejection, and automatic locking to `RESERVED` | `rental-service` (Port 8083) | `POST /api/rentals` | `RentalServiceTest.testCreateRentalSuccessLocksReserved`, `testCreateRentalUnavailableEquipmentThrows` | **VERIFIED** |
| **REQ-DSP-01** | Dispatch | Job-site dispatch creation linked to confirmed rental reservation | `dispatch-service` (Port 8084) | `POST /api/dispatch` | `DispatchServiceTest.testCreateDispatchSavesAndRecordsHistory` | **VERIFIED** |
| **REQ-DSP-02** | Dispatch | Multi-stage lifecycle progression (`PLANNED` → `DISPATCHED` → `IN_TRANSIT` → `ARRIVED` → `IN_USE` → `RETURNED`) | `dispatch-service` (Port 8084) | `PATCH /api/dispatch/{id}/status` | `DispatchServiceTest.testFullStatusLifecycle` | **VERIFIED** |
| **REQ-DSP-03** | Dispatch | Automated equipment synchronization upon dispatch status transition | `dispatch-service` (Port 8084) | `PATCH /api/dispatch/{id}/status` | `DispatchServiceTest.testUpdateDispatchStatusTransitionsAndAudits` | **VERIFIED** |
| **REQ-EUR-01** | Service Discovery | Microservice registry, health heartbeats, and dynamic discovery | `eureka-server` (Port 8761) | `http://localhost:8761` | Eureka Registry Verification | **VERIFIED** |
| **REQ-GTW-01** | API Gateway | Reverse proxy routing to business microservices via `lb://<SERVICE-NAME>` | `api-gateway` (Port 8080) | `http://localhost:8080/api/**` | `ApiGatewayApplicationTest.testJwtUtilBeanExists` | **VERIFIED** |
| **REQ-GTW-02** | Security & CORS | Global JWT validation filter and Cross-Origin Resource Sharing for `http://localhost:5173` | `api-gateway` (Port 8080) | Global Filter | `ApiGatewayApplicationTest` | **VERIFIED** |
| **REQ-DOC-01** | Documentation | OpenAPI 3.0 / Swagger UI with Bearer JWT authorization for all 5 business microservices | All 5 Services | `http://localhost:<PORT>/swagger-ui.html` | Swagger UI configuration across all modules | **VERIFIED** |
| **REQ-UI-01** | Frontend | Enterprise React 19 + Vite + Tailwind CSS SPA with responsive navigation & AuthContext | `frontend/buildasset-react` (Port 5173) | 16 Pages (`/signin`, `/dashboard`, etc.) | Production build `npm run build` | **VERIFIED** |
| **REQ-DATA-01** | Database | Zero initial business records; Schema-per-service isolation in PostgreSQL `buildasset_db` | `database/schema.sql`, `seed.sql` | `auth_schema`, `contractor_schema`, `equipment_schema`, `rental_schema`, `dispatch_schema` | Schema isolation verification | **VERIFIED** |
