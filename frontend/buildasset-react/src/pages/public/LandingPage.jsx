import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import ThemeToggle from "../../components/ui/ThemeToggle";
import {
  Tractor,
  CalendarDays,
  Truck,
  Wrench,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Building2,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ChevronRight,
  Activity,
  HardHat,
  Cpu,
} from "lucide-react";

const LandingPage = () => {
  const capabilities = [
    {
      title: "Equipment Fleet",
      subtitle: "Machinery Assets & Telemetry",
      icon: Tractor,
      color: "amber",
      badge: "Fleet Visibility",
      points: [
        "Heavy machinery catalog with authoritative daily lease rates",
        "Real-time operational status (AVAILABLE, RESERVED, IN USE, MAINTENANCE)",
        "Technical specifications, serial codes, and location yard tracking",
        "Automated asset state transitions synchronized with contracts",
      ],
    },
    {
      title: "Rental Management",
      subtitle: "Contractor Booking Reservations",
      icon: CalendarDays,
      color: "emerald",
      badge: "Booking Lifecycle",
      points: [
        "Server-authoritative rental duration and cost calculation",
        "Conflict-free booking reservations preventing overlapping leases",
        "Unique booking reference codes (RNT-XXXX) and contractor linking",
        "Automated machinery locking upon lease confirmation",
      ],
    },
    {
      title: "Job-Site Dispatch",
      subtitle: "Fleet Routing & Operator Deployment",
      icon: Truck,
      color: "cyan",
      badge: "Logistics Tracking",
      points: [
        "Operator assignment for certified heavy equipment drivers",
        "Locking delivery destination to confirmed rental site address",
        "Multi-stage progression: PLANNED → DISPATCHED → IN TRANSIT → ARRIVED",
        "Carrier logistics tracking and site contact verification",
      ],
    },
    {
      title: "Maintenance & Service",
      subtitle: "Predictive Care & Equipment Readiness",
      icon: Wrench,
      color: "purple",
      badge: "Asset Longevity",
      points: [
        "Routine service and emergency repair scheduling",
        "Technician assignment and service expenditure tracking",
        "Automatic transition to MAINTENANCE status during overhaul",
        "Inspection log history and next-service-due reminders",
      ],
    },
  ];

  const lifecycleStages = [
    { name: "AVAILABLE", desc: "Yard ready for booking", color: "emerald", step: "01" },
    { name: "RESERVED", desc: "Contractor lease locked", color: "amber", step: "02" },
    { name: "DISPATCHED", desc: "Assigned & loaded for route", color: "blue", step: "03" },
    { name: "IN TRANSIT", desc: "En route to job site", color: "cyan", step: "04" },
    { name: "ARRIVED", desc: "Delivered at site coordinates", color: "indigo", step: "05" },
    { name: "IN USE", desc: "Active on-site operations", color: "amber", step: "06" },
    { name: "RETURNED", desc: "Demobilized & back in yard", color: "emerald", step: "07" },
  ];

  const architectureChain = [
    {
      role: "Contractor",
      desc: "Enterprise client requesting heavy equipment for construction projects",
      icon: Building2,
      accent: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      role: "Rental Contract",
      desc: "Authoritative booking record with validated date range, daily rate & total cost",
      icon: CalendarDays,
      accent: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      role: "Dispatch Order",
      desc: "Logistics mission locking destination to verified rental delivery address",
      icon: Truck,
      accent: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      role: "Operator",
      desc: "Certified operator managing machinery transit, arrival and active operation",
      icon: UserCheck,
      accent: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      role: "Equipment",
      desc: "Heavy machinery asset dynamically updated to RESERVED, DISPATCHED, or IN USE",
      icon: Tractor,
      accent: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      role: "Maintenance",
      desc: "Continuous service logging, inspection checks and overhaul management",
      icon: Wrench,
      accent: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-amber-500 selection:text-slate-950 transition-colors">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute -inset-1 rounded-2xl bg-amber-500/20 blur-sm group-hover:bg-amber-500/30 transition-all" />
                <img
                  src={logo}
                  alt="BuildAsset Logistics"
                  className="relative w-9 h-9 sm:w-11 sm:h-11 object-contain transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2 leading-none">
                  BUILDASSET LOGISTICS
                </span>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mt-0.5">
                  Heavy Machinery Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600 dark:text-slate-300">
              <a href="#capabilities" className="hover:text-amber-500 transition-colors">
                Capabilities
              </a>
              <a href="#lifecycle" className="hover:text-amber-500 transition-colors">
                Lifecycle
              </a>
              <a href="#architecture" className="hover:text-amber-500 transition-colors">
                Architecture
              </a>
              <a href="#about" className="hover:text-amber-500 transition-colors">
                About
              </a>
            </nav>

            {/* Right CTAs */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 hover:shadow-lg transition-all duration-200 flex items-center gap-1.5"
              >
                <span>Create Account</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Ambient Industrial Lighting Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[350px] sm:h-[500px] bg-gradient-to-tr from-amber-500/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-2xl pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none animate-pulse-slow" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold tracking-wide uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Enterprise Heavy Logistics Platform
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-[1.1]">
              Heavy Equipment. <br />
              <span className="bg-gradient-to-r from-amber-500 via-amber-400 to-cyan-400 bg-clip-text text-transparent">
                Smarter Operations.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Authoritative heavy machinery fleet management, real-time job-site dispatch coordination, verified contractor rentals, and predictive service maintenance — all unified in one high-performance platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group lightable-btn cursor-pointer"
              >
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 dark:hover:border-amber-500/40 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-sm hover:shadow-md hover:scale-[1.02] transition-all flex items-center justify-center gap-2 lightable-btn cursor-pointer"
              >
                <span>Create Enterprise Account</span>
              </Link>
            </div>

            {/* Telemetry Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-10 text-left">
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-sm lightable lightable-border hover:scale-[1.02] transition-all cursor-default">
                <span className="text-xl sm:text-2xl font-black text-amber-500 block">100%</span>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Conflict-Free Booking
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-sm lightable lightable-cyan lightable-border hover:scale-[1.02] transition-all cursor-default">
                <span className="text-xl sm:text-2xl font-black text-cyan-500 block">7-Stage</span>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Dispatch Lifecycle
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-sm lightable lightable-emerald lightable-border hover:scale-[1.02] transition-all cursor-default">
                <span className="text-xl sm:text-2xl font-black text-emerald-500 block">Role-Based</span>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Enterprise RBAC
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-sm lightable lightable-purple lightable-border hover:scale-[1.02] transition-all cursor-default">
                <span className="text-xl sm:text-2xl font-black text-purple-500 block">Real-Time</span>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Fleet Telemetry
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Capabilities Section */}
      <section id="capabilities" className="py-16 sm:py-24 border-t border-slate-200/80 dark:border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              <Layers className="w-4 h-4" />
              Core Capabilities
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Engineered for Industrial Fleet Operations
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Complete end-to-end tooling designed specifically for heavy equipment logistics, contractor leases, operator assignments, and preventive maintenance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {capabilities.map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <div
                  key={idx}
                  className={`group relative p-7 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] backlight-amber overflow-hidden lightable lightable-${cap.color} lightable-border cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-5 relative z-10">
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {cap.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-1 relative z-10">
                    {cap.title}
                  </h3>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-4 relative z-10">
                    {cap.subtitle}
                  </p>

                  <ul className="space-y-2.5 relative z-10">
                    {cap.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Operational Lifecycle Section */}
      <section id="lifecycle" className="py-16 sm:py-24 bg-slate-100/50 dark:bg-slate-900/30 border-t border-slate-200/80 dark:border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
              <Activity className="w-4 h-4" />
              Operational Lifecycle
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              State-Driven Asset Progression
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Machinery and dispatch states advance synchronously across database records, preventing double-bookings and maintaining strict operational accuracy.
            </p>
          </div>

          {/* Connected Lifecycle Stepper */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 sm:gap-4 relative">
            {lifecycleStages.map((stage, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-cyan-500/50 hover:shadow-lg transition-all duration-200 hover:scale-[1.03] flex flex-col justify-between lightable lightable-border cursor-pointer"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      STAGE {stage.step}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-amber-500 group-hover:animate-ping" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 tracking-wider">
                    {stage.name}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium relative z-10">
                  {stage.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center max-w-2xl mx-auto lightable lightable-border">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-bold flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              Role Permissions: OPERATOR advances dispatch stages; CONTRACTOR views live status.
            </p>
          </div>
        </div>
      </section>

      {/* Enterprise Architecture Section */}
      <section id="architecture" className="py-16 sm:py-24 border-t border-slate-200/80 dark:border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
              <Cpu className="w-4 h-4" />
              Domain Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Seamless Resource Interlocking
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Each operational entity resolves authoritative relationships across the microservice cluster to maintain pristine data integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {architectureChain.map((node, idx) => {
              const Icon = node.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all space-y-3 lightable lightable-border cursor-pointer group"
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`p-2.5 rounded-xl border ${node.accent} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                      {node.role}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed relative z-10">
                    {node.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-24 bg-slate-100/40 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
            <Building2 className="w-4 h-4" />
            About BuildAsset Logistics
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Built for Modern Infrastructure & Fleet Contractors
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
            BuildAsset Logistics is a specialized enterprise platform created to eliminate operational friction in heavy equipment leasing. By uniting contractors, fleet owners, certified operators, and maintenance technicians on an authoritative digital workflow, we empower construction projects to operate with speed, safety, and transparency.
          </p>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 sm:py-20 relative overflow-hidden border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-cyan-500/10 border border-amber-500/30 text-center space-y-6 relative overflow-hidden backlight-amber lightable lightable-border">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight relative z-10">
              Ready to manage your equipment operations?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto relative z-10">
              Sign in with your enterprise credentials or register your contractor profile to start leasing machinery assets.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 relative z-10">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:shadow-xl hover:scale-[1.02] transition-all lightable-btn cursor-pointer"
              >
                Sign In to Portal
              </Link>
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs hover:border-amber-500 hover:scale-[1.02] transition-all lightable-btn cursor-pointer"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="BuildAsset Logistics Logo"
                className="w-8 h-8 object-contain"
              />
              <div className="text-left">
                <span className="font-black text-sm text-slate-900 dark:text-slate-100 block">
                  BUILDASSET LOGISTICS
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Heavy Machinery Fleet Management, Job-Site Dispatch & Rental Platform
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs font-bold text-slate-600 dark:text-slate-400">
              <Link to="/" className="hover:text-amber-500 transition-colors">
                Home
              </Link>
              <a href="#capabilities" className="hover:text-amber-500 transition-colors">
                Capabilities
              </a>
              <Link to="/login" className="hover:text-amber-500 transition-colors">
                Sign In
              </Link>
              <Link to="/signup" className="hover:text-amber-500 transition-colors">
                Sign Up
              </Link>
              <a href="#about" className="hover:text-amber-500 transition-colors">
                About
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60 text-center text-[11px] text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} BuildAsset Logistics. Enterprise Construction & Fleet Management Platform.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
