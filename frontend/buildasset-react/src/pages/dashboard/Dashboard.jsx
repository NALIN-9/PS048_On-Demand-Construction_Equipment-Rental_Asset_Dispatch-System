import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../context/AuthContext";
import EquipmentCard from "../../components/equipment/EquipmentCard";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { CardSkeleton, StatCardSkeleton } from "../../components/ui/LoadingSkeleton";
import logo from "../../assets/logo.png";
import {
  Tractor,
  CalendarCheck,
  Truck,
  Wrench,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  ArrowRight,
  Filter,
  ShieldCheck,
  HardHat,
  ChevronRight,
  BarChart3,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canAddEquipment = user?.role === "ROLE_ADMIN";

  // Stats & Data State (Real API Only - Zero Fake Data)
  const [stats, setStats] = useState({
    totalEquipment: 0,
    availableEquipment: 0,
    reservedEquipment: 0,
    inUseEquipment: 0,
    activeRentals: 0,
    activeDispatches: 0,
    maintenanceDue: 0,
  });

  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filter State
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const categories = [
    "ALL",
    "Excavator",
    "Bulldozer",
    "Crane",
    "Dump Truck",
    "Backhoe Loader",
    "Compactor",
  ];

  const statusOptions = [
    { label: "All Fleet", value: "ALL" },
    { label: "Available", value: "AVAILABLE" },
    { label: "Reserved", value: "RESERVED" },
    { label: "Dispatched", value: "DISPATCHED" },
    { label: "In Use", value: "IN_USE" },
    { label: "Returned", value: "RETURNED" },
    { label: "Maintenance", value: "MAINTENANCE" },
  ];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch fleet statistics and initial equipment list through API Gateway (:8080)
      const [statsRes, equipRes, rentalRes, dispatchRes] = await Promise.allSettled([
        axiosClient.get("/api/equipment/stats"),
        axiosClient.get("/api/equipment"),
        axiosClient.get("/api/rentals"),
        axiosClient.get("/api/dispatches"),
      ]);

      let totalEq = 0;
      let availEq = 0;
      let resEq = 0;
      let inUseEq = 0;
      let maintEq = 0;
      let activeRent = 0;
      let activeDisp = 0;

      if (statsRes.status === "fulfilled" && statsRes.value.data) {
        const s = statsRes.value.data;
        totalEq = s.total ?? s.totalEquipment ?? 0;
        availEq = s.available ?? s.availableCount ?? 0;
        resEq = s.reserved ?? s.reservedCount ?? 0;
        inUseEq = (s.dispatched ?? s.dispatchedCount ?? 0) + (s.inUse ?? s.inUseCount ?? 0);
        maintEq = s.maintenance ?? s.maintenanceCount ?? 0;
      }

      if (equipRes.status === "fulfilled" && Array.isArray(equipRes.value.data)) {
        const eqData = equipRes.value.data;
        setEquipmentList(eqData);
        if (totalEq === 0 && eqData.length > 0) {
          totalEq = eqData.length;
          availEq = eqData.filter((e) => e.status?.toUpperCase() === "AVAILABLE").length;
          resEq = eqData.filter((e) => e.status?.toUpperCase() === "RESERVED").length;
          inUseEq = eqData.filter((e) => e.status?.toUpperCase() === "IN_USE" || e.status?.toUpperCase() === "DISPATCHED").length;
          maintEq = eqData.filter((e) => e.status?.toUpperCase() === "MAINTENANCE").length;
        }
      }

      if (rentalRes.status === "fulfilled" && Array.isArray(rentalRes.value.data)) {
        activeRent = rentalRes.value.data.filter((r) => r.status === "CONFIRMED" || r.status === "ACTIVE").length;
      }

      if (dispatchRes.status === "fulfilled" && Array.isArray(dispatchRes.value.data)) {
        activeDisp = dispatchRes.value.data.filter((d) => d.status !== "RETURNED" && d.status !== "CANCELLED").length;
      }

      setStats({
        totalEquipment: totalEq,
        availableEquipment: availEq,
        reservedEquipment: resEq,
        inUseEquipment: inUseEq,
        activeRentals: activeRent,
        activeDispatches: activeDisp,
        maintenanceDue: maintEq,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to fetch live telemetry. Ensure backend services are running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filtered Equipment according to search keyword and filter criteria
  const filteredEquipment = equipmentList.filter((item) => {
    const matchesKeyword =
      !searchKeyword ||
      item.name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.equipmentCode?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.manufacturer?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchKeyword.toLowerCase());

    const matchesStatus =
      selectedStatus === "ALL" ||
      item.status?.toUpperCase() === selectedStatus.toUpperCase();

    const matchesCategory =
      selectedCategory === "ALL" ||
      item.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesKeyword && matchesStatus && matchesCategory;
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/equipment?keyword=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. HERO BANNER SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 dark:from-slate-900 dark:via-slate-950 dark:to-black border border-slate-800 p-8 sm:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-amber-600/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wide">
              <img src={logo} alt="Logo" className="w-4 h-4 object-contain" />
              ENTERPRISE HEAVY MACHINERY PLATFORM
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Manage Heavy Equipment. <br />
              <span className="text-amber-400">Rent. Dispatch. Track.</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
              Manage your equipment, rental operations, contractor bookings,
              dispatch activities and maintenance from one centralized enterprise platform.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/equipment"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] lightable-btn cursor-pointer"
              >
                <Tractor className="w-4 h-4" />
                Browse Equipment
              </Link>
              <Link
                to="/rentals/book"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-100 font-bold text-sm border border-slate-700 hover:border-slate-600 transition-all hover:scale-[1.02] lightable-btn cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4 text-amber-400" />
                Book Rental
              </Link>
            </div>
          </div>

          {/* Official Brand Shield Emblem */}
          <div className="hidden lg:flex lg:col-span-4 justify-end items-center">
            <div className="relative p-6 rounded-3xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-md shadow-2xl flex items-center justify-center lightable lightable-border">
              <div className="absolute inset-0 rounded-3xl bg-amber-500/5 blur-xl pointer-events-none" />
              <img
                src={logo}
                alt="BuildAsset Logistics Official Logo"
                className="w-40 h-40 object-contain drop-shadow-2xl relative z-10 transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. REAL-TIME KPI TELEMETRY METRICS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            Fleet Operations Overview
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">Live Telemetry</span>
        </div>

        {loading ? (
          <StatCardSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Total Fleet */}
            <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex items-center justify-between lightable lightable-border cursor-pointer group hover:scale-[1.02]">
              <div className="relative z-10">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Fleet
                </p>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
                  {stats.totalEquipment}
                </p>
                <span className="text-[11px] text-slate-400 font-medium">Registered assets</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60 relative z-10 transition-transform group-hover:scale-110">
                <Tractor className="w-6 h-6" />
              </div>
            </div>

            {/* Available Machinery */}
            <div className="p-5 rounded-2xl border border-emerald-100 dark:border-slate-800 bg-emerald-50/30 dark:bg-slate-900 shadow-sm hover:shadow-xl hover:border-emerald-200 dark:hover:border-slate-700 transition-all duration-200 flex items-center justify-between lightable lightable-emerald lightable-border cursor-pointer group hover:scale-[1.02]">
              <div className="relative z-10">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Available
                </p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {stats.availableEquipment}
                </p>
                <span className="text-[11px] text-slate-400 font-medium">Ready for rental</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 relative z-10 transition-transform group-hover:scale-110">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            {/* Reserved / Dispatched / In Use */}
            <div className="p-5 rounded-2xl border border-cyan-100 dark:border-slate-800 bg-cyan-50/30 dark:bg-slate-900 shadow-sm hover:shadow-xl hover:border-cyan-200 dark:hover:border-slate-700 transition-all duration-200 flex items-center justify-between lightable lightable-cyan lightable-border cursor-pointer group hover:scale-[1.02]">
              <div className="relative z-10">
                <p className="text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">
                  Active On-Site
                </p>
                <p className="text-2xl sm:text-3xl font-black text-cyan-700 dark:text-cyan-400 mt-1">
                  {stats.inUseEquipment + stats.reservedEquipment}
                </p>
                <span className="text-[11px] text-slate-400 font-medium">Reserved or deployed</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20 relative z-10 transition-transform group-hover:scale-110">
                <Truck className="w-6 h-6" />
              </div>
            </div>

            {/* Maintenance Service */}
            <div className="p-5 rounded-2xl border border-orange-100 dark:border-slate-800 bg-orange-50/30 dark:bg-slate-900 shadow-sm hover:shadow-xl hover:border-orange-200 dark:hover:border-slate-700 transition-all duration-200 flex items-center justify-between lightable lightable-orange lightable-border cursor-pointer group hover:scale-[1.02]">
              <div className="relative z-10">
                <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                  Maintenance
                </p>
                <p className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400 mt-1">
                  {stats.maintenanceDue}
                </p>
                <span className="text-[11px] text-slate-400 font-medium">Under service</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/20 relative z-10 transition-transform group-hover:scale-110">
                <Wrench className="w-6 h-6" />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. PROMINENT EQUIPMENT SEARCH & FILTER CONTROLS */}
      <section className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 lightable lightable-border">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Keyword Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search machinery by name, code, manufacturer, location..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </form>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "ALL" ? "All Categories" : cat}
                </option>
              ))}
            </select>

            {canAddEquipment && (
              <Link
                to="/equipment/add"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Equipment
              </Link>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {statusOptions.map((st) => (
            <button
              key={st.value}
              onClick={() => setSelectedStatus(st.value)}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedStatus === st.value
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </section>

      {/* 4. FLEET CATALOG GRID / EMPTY STATE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Machinery Inventory
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredEquipment.length} of {equipmentList.length} verified assets
            </p>
          </div>

          <Link
            to="/equipment"
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
          >
            Full Catalog View
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchDashboardData} />}

        {loading ? (
          <CardSkeleton count={3} />
        ) : filteredEquipment.length === 0 ? (
          <EmptyState
            icon={Tractor}
            title={equipmentList.length === 0 ? "Your equipment catalog is currently empty." : "No matching machinery found"}
            description={
              equipmentList.length === 0
                ? "No equipment has been registered in the database yet. Click below to add your first heavy machinery asset."
                : "No machinery matched your current search filters. Try adjusting your search keyword or status filter."
            }
            actionLabel={canAddEquipment ? "Add Equipment" : undefined}
            actionLink={canAddEquipment ? "/equipment/add" : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((eq) => (
              <EquipmentCard key={eq.id} equipment={eq} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
