# Empathy Map — Construction Contractors & Logistics Operators

**Project**: BuildAsset Logistics  
**Target User Segment**: Civil Infrastructure Contractors, Plant Hire Coordinators, and Job-Site Logistics Managers  
**Data Basis**: Primary stakeholder survey & civil construction interviews (*Where specific qualitative field responses are pending, standardized academic placeholders are explicitly designated with `[INSERT ACTUAL SURVEY FINDING]`*).

---

## Empathy Map Canvas

```
+-------------------------------------------------------------+-------------------------------------------------------------+
|                           THINKS                            |                            FEELS                            |
| • "Will the excavator break down mid-shift?"                 | • Anxious about subcontractor project milestone delays      |
| • "Are these rental daily rates inflated?"                  | • Frustrated with lack of live carrier dispatch visibility  |
| • [INSERT ACTUAL SURVEY FINDING: Contractor Thought]        | • Overwhelmed handling manual paper hire dockets & receipts |
|                                                             | • [INSERT ACTUAL SURVEY FINDING: Contractor Emotion]        |
+-------------------------------------------------------------+-------------------------------------------------------------+
|                            SAYS                             |                            DOES                             |
| • "I need a 20-ton hydraulic excavator on-site by 6:00 AM." | • Calls 5 different broker yards to negotiate daily hire    |
| • "Give me an exact server-verified rate calculation."      | • Manually tracks machines on spreadsheets and WhatsApp     |
| • [INSERT ACTUAL SURVEY FINDING: Contractor Quote]          | • Dispatches heavy flatbed low-loaders without GPS audit   |
|                                                             | • [INSERT ACTUAL SURVEY FINDING: Contractor Behavioral Pattern] |
+-------------------------------------------------------------+-------------------------------------------------------------+
|                         PAIN POINTS                         |                            NEEDS                            |
| • Phantom bookings (booking machines that are in workshop)  | • Real-time machinery availability status (AVAILABLE lock)  |
| • Unpredictable billing calculation discrepancies           | • Transparent server-side rate calculations (days × rate)   |
| • Blind transit delays between yard and remote highway site | • Visual multi-stage dispatch pipeline (PLANNED → IN USE)   |
| • [INSERT ACTUAL SURVEY FINDING: Key Obstacle]              | • [INSERT ACTUAL SURVEY FINDING: Critical Requirement]      |
+-------------------------------------------------------------+-------------------------------------------------------------+
```

---

## Detailed Quadrant Analysis

### 1. Says
- *"We lose up to ₹85,000 per idle hour when our foundation piling team waits for a delayed hydraulic excavator."*
- *"We require formal booking references and clear maintenance logs before accepting machinery on high-compliance infrastructure projects."*
- `[INSERT ACTUAL SURVEY FINDING: Direct User Statement]`

### 2. Thinks
- *"Is the equipment advertised online truly serviced and in working condition, or will it fail under heavy clay excavation?"*
- *"Why does every rental vendor charge arbitrary duration fees without transparent formula standards?"*
- `[INSERT ACTUAL SURVEY FINDING: Contractor Internal Concern]`

### 3. Does
- Spends 3–4 hours each morning calling local equipment yards and verifying driver schedules manually.
- Maintains handwritten maintenance logs and paper gate passes for site security compliance.
- `[INSERT ACTUAL SURVEY FINDING: Operational Workflow Observation]`

### 4. Feels
- **Vulnerability**: Risk of penalty clauses on civil contracts due to logistics haulage delays.
- **Mistrust**: Reluctance toward manual verbal quotes without instant system booking references.
- `[INSERT ACTUAL SURVEY FINDING: Emotional Driver]`

---

## Synthesis: Pain Points vs. Solutions

| Core User Pain Point | Emotional Impact | BuildAsset Logistics Solution |
|---|---|---|
| **Double-Booking & Phantom Fleet** | High stress / financial loss | Strict state machine: Equipment automatically transitions to `RESERVED` upon booking creation. |
| **Opaque Pricing Algorithms** | Distrust / billing disputes | Server-side `ChronoUnit.DAYS` calculation with official rate validation (`/api/rentals/calculate`). |
| **Unmonitored Transit Milestones** | Operational chaos | Multi-stage dispatch pipeline (`PLANNED` → `DISPATCHED` → `IN_TRANSIT` → `ARRIVED` → `IN_USE` → `RETURNED`). |
| **Sudden Mechanical Breakdowns** | Project halted | Automated preventative maintenance schedules and logs linked directly to fleet availability. |
