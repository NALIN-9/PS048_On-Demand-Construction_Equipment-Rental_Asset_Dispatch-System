import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../ui/ThemeToggle";
import logo from "../../assets/logo.png";
import {
  HardHat,
  LayoutDashboard,
  Users,
  Tractor,
  CalendarDays,
  Truck,
  Wrench,
  User,
  LogOut,
  Menu,
  X,
  Activity,
  Search,
} from "lucide-react";

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const role = user?.role || "ROLE_CONTRACTOR";

  const allNavLinks = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["ROLE_ADMIN", "ROLE_CONTRACTOR", "ROLE_OPERATOR"] },
    { label: "Contractors", path: "/contractors", icon: Users, roles: ["ROLE_ADMIN"] },
    { label: "Equipment", path: "/equipment", icon: Tractor, roles: ["ROLE_ADMIN", "ROLE_CONTRACTOR", "ROLE_OPERATOR"] },
    { label: "Rentals", path: "/rentals", icon: CalendarDays, roles: ["ROLE_ADMIN", "ROLE_CONTRACTOR", "ROLE_OPERATOR"] },
    { label: "Dispatch", path: "/dispatch", icon: Truck, roles: ["ROLE_ADMIN", "ROLE_CONTRACTOR", "ROLE_OPERATOR"] },
    { label: "Maintenance", path: "/maintenance", icon: Wrench, roles: ["ROLE_ADMIN", "ROLE_OPERATOR"] },
  ];

  const navLinks = allNavLinks.filter((link) => link.roles.includes(role));

  const isActive = (path) => {
    if (path === "/dashboard") return location.pathname === "/dashboard" || location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <img
                src={logo}
                alt="BuildAsset Logistics Logo"
                className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5 leading-none">
                  BUILDASSET
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    B2B
                  </span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mt-0.5">
                  Heavy Logistics
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all lightable-btn ${
                    active
                      ? "bg-amber-500 text-slate-950 shadow-sm"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Gateway Status Pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 lightable lightable-border">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse relative z-10" />
              <span className="font-mono relative z-10">Gateway :8080</span>
            </div>

            {/* Dark / Light Mode Toggle */}
            <ThemeToggle />

            {/* User Profile & Actions */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500/40 dark:hover:border-amber-500/40 transition-colors shadow-sm lightable lightable-border hover:scale-[1.02]"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black text-xs flex items-center justify-center relative z-10">
                    {user.username ? user.username.substring(0, 2).toUpperCase() : "U"}
                  </div>
                  <div className="hidden sm:block text-left relative z-10">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none">
                      {user.fullName || user.username}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                      {user.role || "ROLE_CONTRACTOR"}
                    </p>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-sm lightable-btn"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
