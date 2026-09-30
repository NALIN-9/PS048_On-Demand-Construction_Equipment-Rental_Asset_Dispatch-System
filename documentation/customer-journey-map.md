# Customer Journey Map — BuildAsset Logistics

**Platform**: BuildAsset Logistics Enterprise Heavy Equipment Platform  
**User**: Civil Infrastructure Contractor / Logistics Manager  
**Scope**: End-to-End Equipment Lifecycle (Discovery through Return & Post-Lease Feedback)

---

## Complete Multi-Stage Customer Journey

```
+---------------------------------------------------------------------------------------------------------------------------------------------------+
| STAGE 1: Discover           → STAGE 2: Search Equipment     → STAGE 3: Check Availability   → STAGE 4: Book Rental      → STAGE 5: Confirmation   |
| STAGE 6: Dispatch Execution → STAGE 7: Equipment On-Site Use → STAGE 8: Machine Return      → STAGE 9: Audit & Feedback                           |
+---------------------------------------------------------------------------------------------------------------------------------------------------+
```

---

## Detailed Journey Breakdown Matrix

| Stage | User Action | Touchpoint | Pain Point | Emotion | Strategic Opportunity | BuildAsset Logistics Solution |
|---|---|---|---|---|---|---|
| **1. Discover** | Contractor visits platform seeking heavy machinery hire. | Landing / `/signin` / `/signup` | Distrust of unverified rental brokers and hidden signup fees. | Skeptical 😐 | Fast, enterprise-grade registration with immediate JWT onboarding. | Contractor registration with BCrypt security & company verification. |
| **2. Search Equipment** | Filters machinery by Category, Location, and Manufacturer. | `/equipment` Fleet Inventory | Cluttered interfaces with out-of-date specifications and fake listings. | Focused 🧐 | Real-time multi-criteria filtering with live fleet inventory. | Instant search across categories (Excavators, Cranes, Bulldozers) and yard hubs. |
| **3. Check Availability** | Inspects machine specs, daily rates, and maintenance health logs. | `/equipment/:id` Specification View | Equipment listed as available is actually broken or under repair. | Anxious 😟 | Comprehensive maintenance audit logs visible before booking. | Real-time status badge (`AVAILABLE`, `MAINTENANCE`) and 250hr/500hr service history. |
| **4. Book Rental** | Selects start & end dates and reviews server-side price quote. | `/rentals/book` Booking Interface | Frontend billing discrepancies and misleading quotation calculations. | Hopeful 🙂 | Transparent server-side price guarantee (`ChronoUnit.DAYS × dailyRate`). | Server endpoint `/api/rentals/calculate` determines binding quote; frontend amounts are never trusted. |
| **5. Confirmation** | Submits booking and receives unique booking reference (`BK-...`). | `/rentals/:id` Booking Invoice | Lack of formal reservation guarantee; fears machine will be leased to another bidder. | Relieved 😌 | Instant atomic locking of equipment status to `RESERVED`. | Immediate database lock in `rental_schema` and status sync in `equipment_schema`. |
| **6. Dispatch Execution** | Coordinates flatbed carrier, driver, and destination job-site route. | `/dispatch` Logistics Board | Zero visibility into when the heavy trailer departed the depot. | Impatient ⏱️ | Multi-stage visual pipeline (`PLANNED` → `DISPATCHED` → `IN_TRANSIT` → `ARRIVED`). | Interactive dispatch board with automated status history audit logs. |
| **7. Equipment On-Site Use** | Operates machinery on active foundation / highway grading site. | `/dispatch/:id` Active Tracking | Unexpected machinery breakdown during mission-critical concrete pour. | Productive 👷 | Machine status reflects active `IN_USE` state across platform. | Machinery status locked to `IN_USE`, preventing double allocation. |
| **8. Machine Return** | Completes earthworks; returns equipment to regional logistics yard. | `/dispatch/:id` Return Action | Dispute over exact return timestamp and excessive daily billing penalties. | Satisfied 🚛 | Timestamped actual return logging; machine automatically set to `AVAILABLE`. | Dispatch marked `RETURNED`; equipment state immediately resets to `AVAILABLE` for the next leasee. |
| **9. Audit & Feedback** | Reviews completed booking dockets and logs preventative maintenance. | `/maintenance` & `/profile` | Paper receipts lost; difficult to prove site safety compliance during audits. | Confident 😎 | Centralized digital history of all rental transactions and service records. | Permanent immutable audit records in PostgreSQL database with REST API retrieval. |
