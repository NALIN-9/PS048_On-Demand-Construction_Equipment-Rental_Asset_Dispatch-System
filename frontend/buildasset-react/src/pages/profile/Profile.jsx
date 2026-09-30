import React from "react";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../../components/ui/ThemeToggle";
import {
  User,
  ShieldCheck,
  Key,
  CheckCircle2,
  Server,
  Building,
  Mail,
  UserCheck,
} from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ROLE_ADMIN";
  const isOperator = user?.role === "ROLE_OPERATOR";
  const isContractor = user?.role === "ROLE_CONTRACTOR";

  const getRoleDescription = () => {
    if (isAdmin) return "Full unrestricted administrative access across fleet, contractors, rentals, and system gateway.";
    if (isOperator) return "Fleet operations, field equipment status updates, dispatch routing, and machinery maintenance.";
    return "Heavy equipment rental booking, lease contract tracking, and job-site dispatch visibility.";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <User className="w-7 h-7 text-amber-500" />
          Enterprise Identity & Profile
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Authenticated principal credentials, security permissions, and operational role
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* User Card */}
        <div className="md:col-span-5 p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/90 shadow-sm lightable lightable-border flex flex-col items-center text-center space-y-4">
          <div className="relative z-10 flex flex-col items-center text-center space-y-4 w-full">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-black text-2xl flex items-center justify-center shadow-inner">
              {(user?.fullName || user?.username || "U").substring(0, 2).toUpperCase()}
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
                {user?.fullName || user?.username || "Enterprise User"}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.email}</p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{user?.role || "ROLE_CONTRACTOR"}</span>
            </div>

            <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">Theme Preference</span>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="md:col-span-7 p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/90 shadow-sm lightable lightable-border space-y-6">
          <div className="relative z-10 space-y-6">
            {isAdmin ? (
              /* ADMIN-ONLY System & Session Telemetry */
              <>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Server className="w-4 h-4 text-amber-500" />
                  Administrative Session & System Telemetry
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex justify-between items-center lightable lightable-border hover:scale-[1.01] transition-transform">
                    <span className="text-slate-500 font-medium">Authentication Protocol:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      JWT Bearer (HS256 Verified)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex justify-between items-center lightable lightable-border hover:scale-[1.01] transition-transform">
                    <span className="text-slate-500 font-medium">Service Gateway Routing:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      http://localhost:8080
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex justify-between items-center lightable lightable-border hover:scale-[1.01] transition-transform">
                    <span className="text-slate-500 font-medium">Database Multi-Schema:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      PostgreSQL (Port 5433)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex justify-between items-center lightable lightable-border hover:scale-[1.01] transition-transform">
                    <span className="text-slate-500 font-medium">Active Security Authority:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                      ROLE_ADMIN (Full Platform Privileges)
                    </span>
                  </div>
                </div>
              </>
            ) : (
              /* CONTRACTOR & OPERATOR Account Details */
              <>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <UserCheck className="w-4 h-4 text-amber-500" />
                  Account Details & Permissions
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex justify-between items-center lightable lightable-border hover:scale-[1.01] transition-transform">
                    <span className="text-slate-500 font-medium">Principal Username:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {user?.username}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex justify-between items-center lightable lightable-border hover:scale-[1.01] transition-transform">
                    <span className="text-slate-500 font-medium">Official Email:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {user?.email}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex justify-between items-center lightable lightable-border hover:scale-[1.01] transition-transform">
                    <span className="text-slate-500 font-medium">Assigned Enterprise Role:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                      {user?.role}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex justify-between items-center lightable lightable-border hover:scale-[1.01] transition-transform">
                    <span className="text-slate-500 font-medium">Account Authorization Status:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active & Authenticated
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">
                    Scope of Permissions:
                  </span>
                  {getRoleDescription()}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
