@echo off
TITLE BuildAsset Logistics - Stop All Services
echo Stopping all running Spring Boot Java services and Node Vite processes...
taskkill /F /IM java.exe 2>nul
taskkill /F /IM node.exe 2>nul
echo All services stopped cleanly.
pause
