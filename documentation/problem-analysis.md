# Problem Analysis & Architectural Blueprint

**System**: BuildAsset Logistics Enterprise Heavy Equipment Management Platform  
**Target Domain**: Civil Construction, Heavy Plant Hire, and Site Logistics

---

## 1. Existing Industrial Problems
1. **Opaque & Fragmented Asset Sourcing**: Heavy equipment procurement across India relies on decentralized brokers, phone negotiations, and paper ledgers. This results in high rental search friction (avg. 3–5 hours per machine allocation).
2. **Double-Booking & Phantom Inventory**: Rental yards advertise machinery that is either already deployed on remote job sites or sidelined in workshops for mechanical repairs, leading to project downtime.
3. **Arbitrary Pricing & Billing Inconsistencies**: Manual calculations of daily rates, non-working day adjustments, and return overruns frequently cause commercial arbitration between contractors and fleet owners.
4. **Logistics Blind Spots**: Lack of structured dispatch tracking between equipment depots and highway/metro construction job sites creates operational bottlenecks.

---

## 2. Business Problem Statement
> *"Civil engineering contractors lose up to 12% of total project margins due to uncoordinated machinery dispatch schedules, lack of certified equipment maintenance records, and inaccurate manual rental billing calculations."*

---

## 3. Key Stakeholders
- **Civil Infrastructure Contractors**: Leasees requiring guaranteed machinery uptime and predictable pricing.
- **Plant & Equipment Fleet Owners**: Lessors seeking maximized fleet utilization, preventative maintenance compliance, and automated dispatch management.
- **Logistics Dispatch Coordinators**: Operations teams managing flatbed haulage trailers, certified heavy operators, and site gate passes.
- **Executive Management**: Requiring aggregated real-time fleet analytics (Total Equipment, Available, In-Use, Maintenance Due).

---

## 4. Root Cause Analysis (Fishbone / 5-Whys)
- **Why are infrastructure projects delayed?** Machinery arrives late to the job site.
  - **Why does it arrive late?** The dispatch schedule is managed via ad-hoc phone calls without milestone tracking.
    - **Why is there no tracking?** No centralized digital platform connects rental contracts with carrier logistics.
      - **Why?** Legacy plant hire companies rely on isolated desktop spreadsheets.
        - **Root Cause**: Absence of an integrated, microservices-driven distributed system that couples contract reservation with automated state-synchronized dispatch and fleet maintenance.

---

## 5. Proposed Solution
BuildAsset Logistics addresses these challenges through a modern, cloud-native **Microservices Architecture**:
- **Isolated Service Schemas**: Schema-per-service database isolation ensuring zero cross-boundary schema pollution.
- **Stateless JWT Security**: Industry-standard cryptographic token authentication validated at the API Gateway.
- **Dynamic Service Discovery**: Netflix Eureka enabling dynamic microservice registration and resilient inter-service load balancing.
- **Server-Authoritative Rate Engine**: Strict backend validation of rental durations (`ChronoUnit.DAYS`) and total costs.
- **Automated State Machine Synchronization**: Synchronized lifecycle updates between Dispatch, Equipment, and Rental domains.

---

## 6. Functional Requirements
- **FR-01 (Authentication)**: Register contractor accounts, hash passwords using BCrypt, issue stateless JWT tokens, and validate authorization headers.
- **FR-02 (Contractor Management)**: CRUD operations on contractor corporate entities with tax licensing and site contact details.
- **FR-03 (Fleet Management)**: Inventory cataloging of machinery with category, manufacturer, model, location, and daily rate specifications.
- **FR-04 (Server-Side Rental Pricing)**: Calculate rental duration and exact total amounts on the backend; reject invalid date ranges and unavailable equipment.
- **FR-05 (Reservation Locking)**: Automatically transition equipment status from `AVAILABLE` to `RESERVED` upon booking confirmation.
- **FR-06 (Dispatch Management)**: Schedule job-site dispatches, advance through the multi-stage pipeline (`PLANNED` → `DISPATCHED` → `IN_TRANSIT` → `ARRIVED` → `IN_USE` → `RETURNED`), and record audit history.
- **FR-07 (Preventative Maintenance)**: Log scheduled and in-progress maintenance services, locking machines into `MAINTENANCE` status and releasing them back to `AVAILABLE` upon completion.

---

## 7. Non-Functional Requirements (NFR)
- **NFR-01 (Security)**: Passwords hashed with BCrypt (10 rounds); JWT signed with 256-bit HMAC key; CORS locked to trusted origins.
- **NFR-02 (Performance)**: Sub-100ms API Gateway response times for routed microservice queries under standard operational load.
- **NFR-03 (Scalability)**: Horizontal scalability of stateless business microservices via Spring Cloud LoadBalancer and Eureka.
- **NFR-04 (Data Integrity)**: Schema isolation (`auth_schema`, `contractor_schema`, `equipment_schema`, `rental_schema`, `dispatch_schema`) in PostgreSQL.
- **NFR-05 (Clean Initial State)**: Zero sample/demo business records hard-coded; all state dynamically generated via REST APIs.

---

## 8. Technical Constraints & Assumptions
- **DBMS**: PostgreSQL 14+ running on `localhost:5432`.
- **Java Runtime**: OpenJDK 17 LTS.
- **Framework**: Spring Boot 3.2.5 + Spring Cloud 2023.0.1.
- **Frontend**: React 19 / Vite / Tailwind CSS running on port `5173`.
- **Inter-Service Communication**: Eureka service-name resolution (`lb://`).

---

## 9. Success Criteria
1. 100% test pass rate across all microservice unit and integration test suites (`mvn clean test`).
2. Seamless end-to-end user workflow: User Sign Up → Sign In → Create Equipment → Book Rental → Calculate Cost → Dispatch → Return → Maintenance.
3. Zero compilation errors, zero console warnings, and successful production frontend build (`npm run build`).
