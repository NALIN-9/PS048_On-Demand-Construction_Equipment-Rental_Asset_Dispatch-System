import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import {
  Server,
  Activity,
  Database,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Layers,
  Zap,
} from "lucide-react";

const SystemStatus = () => {
  const [gatewayStatus, setGatewayStatus] = useState("CONFIGURED");
  const [eurekaStatus, setEurekaStatus] = useState("CONFIGURED");
  const [dbStatus, setDbStatus] = useState("CONFIGURED");
  const [serviceStatuses, setServiceStatuses] = useState({
    "Auth Service": "CONFIGURED",
    "Contractor Service": "CONFIGURED",
    "Equipment Service": "CONFIGURED",
    "Rental Service": "CONFIGURED",
    "Dispatch Service": "CONFIGURED",
  });
  const [lastChecked, setLastChecked] = useState(null);
  const [checking, setChecking] = useState(false);

  const checkGatewayHealth = async () => {
    setChecking(true);
    const updated = { ...serviceStatuses };

    try {
      const res = await axiosClient.get("/api/equipment/stats");
      if (res.status === 200) {
        setGatewayStatus("ONLINE");
        setDbStatus("ONLINE");
        updated["Equipment Service"] = "ONLINE";
      } else {
        setGatewayStatus("DEGRADED");
      }
    } catch (err) {
      if (err.response) {
        setGatewayStatus("ONLINE");
      } else {
        setGatewayStatus("OFFLINE");
      }
    }

    try {
      const contRes = await axiosClient.get("/api/contractors");
      if (contRes.status === 200) updated["Contractor Service"] = "ONLINE";
    } catch (e) {
      if (e.response) updated["Contractor Service"] = "ONLINE";
    }

    try {
      const rentRes = await axiosClient.get("/api/rentals");
      if (rentRes.status === 200) updated["Rental Service"] = "ONLINE";
    } catch (e) {
      if (e.response) updated["Rental Service"] = "ONLINE";
    }

    try {
      const dispRes = await axiosClient.get("/api/dispatches");
      if (dispRes.status === 200) updated["Dispatch Service"] = "ONLINE";
    } catch (e) {
      if (e.response) updated["Dispatch Service"] = "ONLINE";
    }

    setServiceStatuses(updated);
    setLastChecked(new Date().toLocaleTimeString());
    setChecking(false);
  };

  const services = [
    {
      name: "API Gateway",
      port: 8080,
      protocol: "Spring Cloud Gateway (Reactive Netty)",
      status: gatewayStatus,
      basePath: "http://localhost:8080/api/*",
      swaggerUrl: null,
      description: "Central routing, JWT validation and token forwarding edge",
    },
    {
      name: "Eureka Service Discovery",
      port: 8761,
      protocol: "Spring Cloud Netflix Eureka",
      status: eurekaStatus,
      basePath: "http://localhost:8761",
      swaggerUrl: null,
      description: "Dynamic microservice registration and heartbeat discovery registry",
    },
    {
      name: "Auth Service",
      port: 8085,
      protocol: "Spring Boot 3.3.3 + Spring Security + JWT",
      status: serviceStatuses["Auth Service"],
      basePath: "/api/auth/**",
      swaggerUrl: "http://localhost:8085/swagger-ui.html",
      description: "User authentication, BCrypt hashing, and stateless JWT issuance",
    },
    {
      name: "Contractor Service",
      port: 8081,
      protocol: "Spring Boot 3.3.3 + Spring Data JPA",
      status: serviceStatuses["Contractor Service"],
      basePath: "/api/contractors/**",
      swaggerUrl: "http://localhost:8081/swagger-ui.html",
      description: "B2B client profiles, KYC verification and credit management",
    },
    {
      name: "Equipment Service",
      port: 8082,
      protocol: "Spring Boot 3.3.3 + JPA Criteria API",
      status: serviceStatuses["Equipment Service"],
      basePath: "/api/equipment/**",
      swaggerUrl: "http://localhost:8082/swagger-ui.html",
      description: "Heavy machinery inventory, categories, and maintenance records",
    },
    {
      name: "Rental Service",
      port: 8083,
      protocol: "Spring Boot 3.3.3 + OpenFeign Client",
      status: serviceStatuses["Rental Service"],
      basePath: "/api/rentals/**",
      swaggerUrl: "http://localhost:8083/swagger-ui.html",
      description: "Rental reservations, duration calculations and return billing",
    },
    {
      name: "Dispatch Service",
      port: 8084,
      protocol: "Spring Boot 3.3.3 + OpenFeign Client",
      status: serviceStatuses["Dispatch Service"],
      basePath: "/api/dispatches/**",
      swaggerUrl: "http://localhost:8084/swagger-ui.html",
      description: "Fleet logistics, driver telemetry, site delivery and return tracking",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-amber-500" />
            System Status & Gateway Architecture
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time topology, microservices health, Swagger OpenAPI docs, and database telemetry
          </p>
        </div>

        <button
          onClick={checkGatewayHealth}
          disabled={checking}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md lightable-btn hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
          {checking ? "Probing..." : "Probe Gateway"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/90 shadow-sm lightable lightable-border space-y-2 hover:scale-[1.01] transition-transform">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Gateway Status</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  gatewayStatus === "ONLINE"
                    ? "bg-emerald-500 animate-pulse"
                    : gatewayStatus === "CONFIGURED"
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
              />
              <span className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
                {gatewayStatus}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Port :8080 | {lastChecked ? `Probed at ${lastChecked}` : "Ready to probe"}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/90 shadow-sm lightable lightable-border space-y-2 hover:scale-[1.01] transition-transform">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Service Discovery</span>
              <Layers className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${eurekaStatus === "ONLINE" ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
                {eurekaStatus === "ONLINE" ? "EUREKA ONLINE" : "CONFIGURED :8761"}
              </span>
            </div>
            <a
              href="http://localhost:8761"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Open Registry Dashboard :8761 <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/90 shadow-sm lightable lightable-border space-y-2 hover:scale-[1.01] transition-transform">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">PostgreSQL Database</span>
              <Database className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${dbStatus === "ONLINE" ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
                {dbStatus}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Port :5433 | DB: buildasset_db</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/90 shadow-sm lightable lightable-border space-y-2 hover:scale-[1.01] transition-transform">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Auth Protocol</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
                JWT (BEARER)
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">HMAC-SHA256 Stateless Tokens</p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/90 shadow-sm lightable lightable-border space-y-4">
        <div className="relative z-10">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Server className="w-4 h-4 text-amber-500" />
            Microservice Architecture & OpenAPI Documentation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Direct Swagger UI interfaces and architectural contracts for all 5 business services
          </p>
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Port</th>
                <th className="py-3 px-4">Gateway Endpoint</th>
                <th className="py-3 px-4">Tech Stack</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Swagger Docs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {services.map((svc) => (
                <tr key={svc.name} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{svc.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{svc.description}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-500">
                    :{svc.port}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    {svc.basePath}
                  </td>
                  <td className="py-3.5 px-4 text-[11px] text-slate-500 font-medium">
                    {svc.protocol}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                        svc.status === "ONLINE"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : svc.status === "CONFIGURED"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          svc.status === "ONLINE"
                            ? "bg-emerald-500"
                            : svc.status === "CONFIGURED"
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                      />
                      {svc.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {svc.swaggerUrl ? (
                      <a
                        href={svc.swaggerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-amber-500/50 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-sm lightable-btn hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        <span>Open Swagger</span>
                        <ExternalLink className="w-3 h-3 text-amber-500" />
                      </a>
                    ) : (
                      <span className="text-slate-400 text-[11px]">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/90 shadow-sm lightable lightable-border space-y-3">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Database Multi-Schema Isolation
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Each microservice is assigned its own isolated PostgreSQL schema within the <code className="font-mono text-amber-500">buildasset_db</code> database instance:
            </p>
            <ul className="space-y-1.5 text-xs font-mono text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>auth_schema — users, roles, credentials</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>contractor_schema — contractors, KYC, credit</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>equipment_schema — equipment, maintenance_logs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>rental_schema — rentals, billing, terms</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>dispatch_schema — dispatches, tracking, drivers</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/90 shadow-sm lightable lightable-border space-y-3">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                JWT Authentication & Swagger Access
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              All business endpoints are secured via JWT tokens. Use the following guide for Swagger UI direct interaction:
            </p>
            <ol className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-decimal list-inside">
              <li>Generate a JWT token by logging in via frontend or POST to <code className="font-mono text-amber-500">:8085/api/auth/login</code></li>
              <li>Click the <strong>Authorize</strong> button in Swagger UI (e.g. at <code className="font-mono text-amber-500">:8082/swagger-ui.html</code>)</li>
              <li>Paste the JWT token into the <code className="font-mono text-amber-500">bearerAuth</code> field (without 'Bearer ' prefix) and click Authorize</li>
              <li>Execute protected endpoints directly with authenticated role permissions</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
