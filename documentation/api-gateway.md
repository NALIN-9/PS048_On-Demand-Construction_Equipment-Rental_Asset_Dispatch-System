# Spring Cloud API Gateway & Reverse Proxy Architecture

**Component**: `backend/api-gateway/`  
**Port**: `8080`  
**Technology**: Spring Cloud Gateway 2023.0.1, Spring WebFlux, Project Reactor, Netflix Eureka

---

## 1. Gateway Purpose & Architectural Role

The **API Gateway** acts as the single entry point for all client applications (React SPA, mobile clients, external partner APIs). It insulates internal microservice topologies, provides centralized security token verification, manages cross-origin resource sharing (CORS), and performs client-side load balancing across microservice instances.

---

## 2. Route Definitions & Service Discovery

All downstream traffic is dynamically resolved through the Netflix Eureka Service Registry using the `lb://` (load-balanced) scheme:

| Route ID | Path Predicate | Target URI | Destination Service | Port |
|---|---|---|---|---|
| `auth-service` | `/api/auth/**` | `lb://AUTH-SERVICE` | Auth & Registration Microservice | 8085 |
| `contractor-service` | `/api/contractors/**` | `lb://CONTRACTOR-SERVICE` | Contractor Profile Microservice | 8081 |
| `equipment-service` | `/api/equipment/**` | `lb://EQUIPMENT-SERVICE` | Heavy Machinery Fleet Microservice | 8082 |
| `rental-service` | `/api/rentals/**` | `lb://RENTAL-SERVICE` | Rental Quotation & Booking Microservice | 8083 |
| `dispatch-service` | `/api/dispatch/**` | `lb://DISPATCH-SERVICE` | Job-Site Dispatch Logistics Microservice | 8084 |

---

## 3. Gateway Configuration (`application.yml`)

```yaml
server:
  port: 8080

spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      routes:
        - id: auth-service
          uri: lb://AUTH-SERVICE
          predicates:
            - Path=/api/auth/**
        - id: contractor-service
          uri: lb://CONTRACTOR-SERVICE
          predicates:
            - Path=/api/contractors/**
        - id: equipment-service
          uri: lb://EQUIPMENT-SERVICE
          predicates:
            - Path=/api/equipment/**
        - id: rental-service
          uri: lb://RENTAL-SERVICE
          predicates:
            - Path=/api/rentals/**
        - id: dispatch-service
          uri: lb://DISPATCH-SERVICE
          predicates:
            - Path=/api/dispatch/**
      globalcors:
        cors-configurations:
          '[/**]':
            allowedOrigins:
              - "http://localhost:5173"
              - "http://localhost:3000"
            allowedMethods:
              - GET
              - POST
              - PUT
              - DELETE
              - PATCH
              - OPTIONS
            allowedHeaders: "*"
            allowCredentials: true
```

---

## 4. Cross-Origin Resource Sharing (CORS) Policy
- Explicitly permits the React Vite development server (`http://localhost:5173`).
- Handles `OPTIONS` HTTP pre-flight requests immediately without requiring authentication tokens.
- Supports all standard REST verbs (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`).

---

## 5. Centralized Error Handling & JSON Responses
When a request fails authentication or encounters gateway-level issues, the gateway emits structured RFC 7807 compliant JSON error payloads:

```json
{
  "timestamp": "2026-09-18T12:00:00.000Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Missing or malformed Authorization Bearer header"
}
```

---

## 6. Direct Service vs Gateway Access
- **Through Gateway** (`http://localhost:8080/api/...`): Production frontend traffic with JWT validation and unified domain endpoint.
- **Direct Service Testing** (`http://localhost:<PORT>/...`): Developers and test suites can still invoke microservices directly without gateway dependency during isolated unit/integration verification.
