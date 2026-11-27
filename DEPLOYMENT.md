# 🚀 BuildAsset Logistics - Comprehensive Deployment Guide

This guide provides complete instructions for deploying the **BuildAsset Logistics Microservice Platform** across various environments (Local Windows, Docker Containerization, and Cloud VPS/Production).

---

## 🏗️ Architecture & Port Mapping

| Service | Port | Technology | Purpose |
|---|---|---|---|
| **Frontend Web Portal** | `5173` / `80` | React 18, Vite, Tailwind CSS | Management portal & Contractor booking UI |
| **API Gateway** | `8080` | Spring Cloud Gateway, JWT Filter | Single entry point, CORS & routing |
| **Eureka Discovery Server** | `8761` | Spring Cloud Netflix Eureka | Dynamic service registration & heartbeats |
| **Auth Service** | `8085` | Spring Boot 3, Spring Security, JWT | User authentication, RBAC & token issuance |
| **Contractor Service** | `8081` | Spring Boot 3, Spring Data JPA | Contractor business profiles & verification |
| **Equipment Service** | `8082` | Spring Boot 3, Spring Data JPA | Fleet inventory, multi-photo gallery & maintenance |
| **Rental Service** | `8083` | Spring Boot 3, Spring Data JPA | Booking lifecycle & duration rate calculations |
| **Dispatch Service** | `8084` | Spring Boot 3, Spring Data JPA | Fleet logistics, telematics & operator tracking |
| **PostgreSQL Database** | `5433` (or `5432`) | PostgreSQL 16+ | Isolated database schemas per microservice |

---

## 🔐 Default Production Credentials

Pre-configured permanent user accounts automatically seeded into the database:

| Role | Username / Email | Password | Access Capabilities |
|---|---|---|---|
| 👑 **Administrator** | `admin@gmail.com` | `admin@123` | Full fleet management, photo galleries, delete equipment, view all dispatches & maintenance logs |
| 🏗️ **Contractor** | `contractor@gmail.com` | `contractor@123` | Book machinery rentals, calculate durations, view contractor bookings |
| 🔧 **Fleet Operator** | `operator@gmail.com` | `operator@123` | Schedule preventative maintenance, mark service completed, logistics dispatches |

---

## 📦 Deployment Method 1: Local Deployment (Windows)

### Prerequisites
- **Java Development Kit (JDK):** Version 17 or higher (`java -version`)
- **Node.js:** Version 18 or higher (`node -v`)
- **PostgreSQL Database:** Running on port `5433` (or configured via environment) with database `buildasset_db` and password `root`

### 1-Click Launch
In the project root directory, run:
```bat
start-all.bat
```
This batch script will:
1. Start Eureka Server (Port 8761)
2. Start Auth Service (Port 8085)
3. Start Contractor Service (Port 8081)
4. Start Equipment Service (Port 8082)
5. Start Rental Service (Port 8083)
6. Start Dispatch Service (Port 8084)
7. Start API Gateway (Port 8080)
8. Launch the React Web UI (Port 5173)

### Stopping All Services
```bat
stop-all.bat
```

---

## 🐳 Deployment Method 2: Docker & Docker Compose (Recommended)

Docker Compose provides a zero-dependency, containerized environment that automatically provisions PostgreSQL, all 7 Spring Boot microservices, and the Nginx-hosted React frontend.

### Prerequisites
- **Docker Desktop** installed and running on your machine.

### Step 1: Build & Launch All Containers
From the root project directory:
```bash
docker-compose up --build -d
```

### Step 2: Verify Running Containers
```bash
docker-compose ps
```

### Step 3: Access Applications
- **Web Application Portal:** [http://localhost](http://localhost) (or [http://localhost:5173](http://localhost:5173))
- **API Gateway:** [http://localhost:8080](http://localhost:8080)
- **Eureka Service Registry:** [http://localhost:8761](http://localhost:8761)
- **Swagger Documentation:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

### Step 4: View Logs
```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f equipment-service
docker-compose logs -f auth-service
```

### Step 5: Teardown
```bash
docker-compose down
```
*(To wipe persistent database volumes as well: `docker-compose down -v`)*

---

## ☁️ Deployment Method 3: Cloud VPS (Ubuntu / Debian / AWS EC2)

### Step 1: Install Docker on the Server
```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Step 2: Clone and Deploy
```bash
git clone <YOUR_GIT_REPOSITORY_URL> equipment_project
cd equipment_project
docker compose up --build -d
```

### Step 3: Firewall Configuration
Ensure the cloud security group or firewall (`ufw`) permits inbound traffic on:
- Port `80` (HTTP Web Portal)
- Port `443` (HTTPS with SSL certs)
- Port `8080` (API Gateway - if calling directly from external clients)

---

## 🧪 Testing and Verification Checklist

1. **Authentication API:**
   ```bash
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin@gmail.com","password":"admin@123"}'
   ```
   *Expected: HTTP 200 with JWT token.*

2. **Fleet Inventory API:**
   ```bash
   curl -X GET http://localhost:8080/api/equipment \
     -H "Authorization: Bearer <TOKEN>"
   ```
   *Expected: HTTP 200 with list of heavy equipment machines.*

3. **Gallery Image PATCH Update:**
   ```bash
   curl -X PATCH http://localhost:8080/api/equipment/7/image \
     -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"imageUrl":"https://images.unsplash.com/photo-1581094288338-2314dddb7ece"}'
   ```
   *Expected: HTTP 200 with updated imageUrl.*

4. **Maintenance Scheduling:**
   ```bash
   curl -X POST http://localhost:8080/api/equipment/7/maintenance \
     -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"maintenanceType":"ROUTINE_SERVICE","scheduledDate":"2026-11-15","cost":1500,"description":""}'
   ```
   *Expected: HTTP 201 Created with auto-generated description and status MAINTENANCE.*
