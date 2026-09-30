@echo off
TITLE BuildAsset Logistics - Launch All Services
echo ===============================================================================
echo            BUILDASSET LOGISTICS - MICROSERVICE PLATFORM LAUNCHER
echo ===============================================================================
echo.

set DB_PORT=5433
set DB_PASSWORD=root

echo [1/8] Starting Eureka Discovery Server (Port 8761)...
start "Eureka Server :8761" cmd /k "cd /d %~dp0backend\eureka-server && java -jar target\eureka-server-1.0.0-SNAPSHOT.jar"
timeout /t 6 /nobreak >nul

echo [2/8] Starting Auth Service (Port 8085)...
start "Auth Service :8085" cmd /k "cd /d %~dp0backend\auth-service && set DB_PORT=%DB_PORT%&& set DB_PASSWORD=%DB_PASSWORD%&& java -jar target\auth-service-1.0.0-SNAPSHOT.jar"

echo [3/8] Starting Contractor Service (Port 8081)...
start "Contractor Service :8081" cmd /k "cd /d %~dp0backend\contractor-service && set DB_PORT=%DB_PORT%&& set DB_PASSWORD=%DB_PASSWORD%&& java -jar target\contractor-service-1.0.0-SNAPSHOT.jar"

echo [4/8] Starting Equipment Service (Port 8082)...
start "Equipment Service :8082" cmd /k "cd /d %~dp0backend\equipment-service && set DB_PORT=%DB_PORT%&& set DB_PASSWORD=%DB_PASSWORD%&& java -jar target\equipment-service-1.0.0-SNAPSHOT.jar"

echo [5/8] Starting Rental Service (Port 8083)...
start "Rental Service :8083" cmd /k "cd /d %~dp0backend\rental-service && set DB_PORT=%DB_PORT%&& set DB_PASSWORD=%DB_PASSWORD%&& java -jar target\rental-service-1.0.0-SNAPSHOT.jar"

echo [6/8] Starting Dispatch Service (Port 8084)...
start "Dispatch Service :8084" cmd /k "cd /d %~dp0backend\dispatch-service && set DB_PORT=%DB_PORT%&& set DB_PASSWORD=%DB_PASSWORD%&& java -jar target\dispatch-service-1.0.0-SNAPSHOT.jar"

echo [7/8] Starting API Gateway (Port 8080)...
timeout /t 4 /nobreak >nul
start "API Gateway :8080" cmd /k "cd /d %~dp0backend\api-gateway && java -jar target\api-gateway-1.0.0-SNAPSHOT.jar"

echo [8/8] Starting React Frontend (Port 5173)...
start "React UI :5173" cmd /k "cd /d %~dp0frontend\buildasset-react && npm run dev"

echo.
echo ===============================================================================
echo ALL SERVICES ARE LAUNCHING!
echo - Eureka Registry:    http://localhost:8761
echo - API Gateway:        http://localhost:8080
echo - React Web Portal:   http://localhost:5173
echo ===============================================================================
pause
