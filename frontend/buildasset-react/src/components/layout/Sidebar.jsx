import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";
import {
  LayoutDashboard,
  Users,
  Tractor,
  CalendarDays,
  Truck,
  Wrench,
  User,
  X,
  HardHat,
  Layers,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.role || "ROLE_CONTRACTOR";

  const allMenuItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["ROLE_ADMIN", "ROLE_CONTRACTOR", "ROLE_OPERATOR"] },
    { label: "Contractors", path: "/contractors", icon: Users, roles: ["ROLE_ADMIN"] },
    { label: "Equipment Fleet", path: "/equipment", icon: Tractor, roles: ["ROLE_ADMIN", "ROLE_CONTRACTOR", "ROLE_OPERATOR"] },
    { label: "Rentals & Bookings", path: "/rentals", icon: CalendarDays, roles: ["ROLE_ADMIN", "ROLE_CONTRACTOR", "ROLE_OPERATOR"] },
    { label: "Dispatch Board", path: "/dispatch", icon: Truck, roles: ["ROLE_ADMIN", "ROLE_CONTRACTOR", "ROLE_OPERATOR"] },
    { label: "Maintenance", path: "/maintenance", icon: Wrench, roles: ["ROLE_ADMIN", "ROLE_OPERATOR"] },
    { label: "Profile & Identity", path: "/profile", icon: User, roles: ["ROLE_ADMIN", "ROLE_CONTRACTOR", "ROLE_OPERATOR"] },
  ];

  const menuItems = allMenuItems.filter((item) => item.roles.includes(role));

  const isActive = (path) => {
    if (path === "/dashboard") return location.pathname === "/dashboard" || location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
            <Link to="/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
              <img
                src={logo}
                alt="BuildAsset Logistics Logo"
                className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="font-black text-sm text-slate-900 dark:text-slate-100 tracking-tight">
                  BUILDASSET
                </span>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">
                  Logistics Portal
                </span>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Management Modules
            </p>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 lightable-btn ${
                    active
                      ? "bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* System Section - ADMIN ONLY */}
            {role === "ROLE_ADMIN" && (
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80">
                <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  System
                </p>
                <Link
                  to="/system"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 lightable-btn ${
                    isActive("/system")
                      ? "bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>System & Gateway</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Microservices Architecture Status Footer - ADMIN ONLY */}
        {role === "ROLE_ADMIN" && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 space-y-2 lightable lightable-border">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 relative z-10">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  Cluster Status
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                  EUREKA OK
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono space-y-0.5 relative z-10">
                <div>API Gateway: <span className="text-slate-700 dark:text-slate-300">8080</span></div>
                <div>Database: <span className="text-slate-700 dark:text-slate-300">PostgreSQL 5433</span></div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
