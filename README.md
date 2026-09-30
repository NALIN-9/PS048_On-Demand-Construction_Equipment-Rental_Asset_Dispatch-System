# BUILDASSET LOGISTICS — Enterprise Heavy Machinery Rental & Dispatch Platform

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
