import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosClient from "../../api/axiosClient";
import Notification from "../../components/ui/Notification";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import {
  CalendarCheck,
  ArrowLeft,
  Tractor,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
} from "lucide-react";

const BookRental = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isContractor = user?.role === "ROLE_CONTRACTOR";
  const [searchParams] = useSearchParams();
  const preSelectedEqId = searchParams.get("equipmentId");

  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [calcError, setCalcError] = useState("");
  const [notification, setNotification] = useState(null);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const [formData, setFormData] = useState({
    contractorId: isContractor ? (user?.userId || "2") : "",
    equipmentId: preSelectedEqId || "",
    startDate: tomorrow.toISOString().split("T")[0],
    endDate: nextWeek.toISOString().split("T")[0],
    deliveryAddress: "",
    notes: "",
  });

  const [calculationResult, setCalculationResult] = useState(null);

  const fetchPrerequisites = async () => {
    try {
      setLoading(true);
      setError("");

      const calls = [axiosClient.get("/api/equipment", { params: { status: "AVAILABLE" } })];
      if (!isContractor) {
        calls.push(axiosClient.get("/api/contractors"));
      }

      const results = await Promise.allSettled(calls);
      const eqRes = results[0];
      const contRes = results[1];

      let eqList = [];
      let contList = [];

      if (eqRes && eqRes.status === "fulfilled" && Array.isArray(eqRes.value.data)) {
        eqList = eqRes.value.data;
      }

      if (contRes && contRes.status === "fulfilled" && Array.isArray(contRes.value.data)) {
        contList = contRes.value.data;
      }

      setAvailableEquipment(eqList);
      setContractors(contList);

      if (isContractor) {
        setFormData((prev) => ({ ...prev, contractorId: user?.userId || "2" }));
      } else if (contList.length > 0 && !formData.contractorId) {
        setFormData((prev) => ({ ...prev, contractorId: contList[0].id }));
      }
      if (eqList.length > 0 && !formData.equipmentId) {
        setFormData((prev) => ({ ...prev, equipmentId: eqList[0].id }));
      }
    } catch {
      setError("Unable to load initial form data. Please verify gateway connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrerequisites();
  }, [preSelectedEqId]);

  // Trigger server-authoritative dynamic rate & duration calculation
  const triggerServerCalculation = async (eqId, start, end) => {
    if (!eqId || !start || !end) return;

    try {
      setCalculating(true);
      setCalcError("");
      const res = await axiosClient.post("/api/rentals/calculate", {
        equipmentId: parseInt(eqId, 10),
        startDate: start,
        endDate: end,
      });
      setCalculationResult(res.data);
    } catch (err) {
      setCalculationResult(null);
      const msg = err.response?.data?.message || "Invalid date range or equipment unavailable.";
      setCalcError(msg);
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    if (formData.equipmentId && formData.startDate && formData.endDate) {
      triggerServerCalculation(formData.equipmentId, formData.startDate, formData.endDate);
    }
  }, [formData.equipmentId, formData.startDate, formData.endDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.contractorId) {
      setNotification({
        type: "error",
        message: "Please select or create a contractor profile before booking.",
      });
      return;
    }
    if (!formData.equipmentId) {
      setNotification({
        type: "error",
        message: "Please select an available machinery asset.",
      });
      return;
    }

    try {
      setBooking(true);
      const payload = {
        contractorId: parseInt(formData.contractorId, 10),
        equipmentId: parseInt(formData.equipmentId, 10),
        startDate: formData.startDate,
        endDate: formData.endDate,
        deliveryAddress: formData.deliveryAddress,
        notes: formData.notes,
      };

      const response = await axiosClient.post("/api/rentals", payload);
      setNotification({
        type: "success",
        message: "Rental contract confirmed! Equipment is now RESERVED.",
      });
      setTimeout(() => {
        navigate(`/rentals/${response.data.id}`);
      }, 1200);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Booking failed. Equipment may have been locked by another contractor.";
      setNotification({ type: "error", message: msg });
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <Link
          to="/rentals"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-500"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Rentals
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6 lightable lightable-border">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
                <CalendarCheck className="w-4 h-4" />
                Heavy Machinery Lease
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                Book Equipment Rental
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Server-calculated lease schedule with automated equipment status locking
              </p>
            </div>

            {error && <ErrorMessage message={error} onRetry={fetchPrerequisites} />}

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <LoadingSpinner size="md" />
                <p className="text-xs text-slate-500 mt-3">Loading available fleet...</p>
              </div>
            ) : availableEquipment.length === 0 ? (
              <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-amber-800 dark:text-amber-300 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  No Available Machinery
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  There is currently no heavy equipment in AVAILABLE status. All units are either reserved, deployed on-site, or under maintenance.
                </p>
                <Link
                  to="/equipment/add"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-sm"
                >
                  <Tractor className="w-3.5 h-3.5" />
                  Add New Equipment Asset
                </Link>
              </div>
            ) : (!isContractor && contractors.length === 0) ? (
              <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-amber-800 dark:text-amber-300 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Users className="w-4 h-4 text-amber-500" />
                  No Contractor Profiles
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  A contractor profile is required to assign equipment rental leases.
                </p>
                <Link
                  to="/contractors"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-sm"
                >
                  <Users className="w-3.5 h-3.5" />
                  Register Contractor Profile
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Contractor Selector */}
                {isContractor ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Leasing Contractor Account
                    </label>
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-500" />
                        {user?.fullName || user?.username} ({user?.email})
                      </span>
                      <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        LOGGED-IN CONTRACTOR
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Assign Contractor <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="contractorId"
                      required
                      value={formData.contractorId}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500/50"
                    >
                      <option value="">Select Contractor</option>
                      {contractors.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.companyName} ({c.contactPerson} • {c.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Equipment Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Heavy Machinery <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="equipmentId"
                    required
                    value={formData.equipmentId}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500/50"
                  >
                    <option value="">Choose Machinery</option>
                    {availableEquipment.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.name} — {eq.equipmentCode} (₹{Number(eq.dailyRate).toLocaleString("en-IN")}/day)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Rental Start Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      required
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Expected Return Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      required
                      min={formData.startDate}
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                </div>

                {/* Job-Site Delivery Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Job-Site Delivery Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="deliveryAddress"
                    required
                    value={formData.deliveryAddress}
                    onChange={handleChange}
                    placeholder="e.g. Metro Line Phase 3, Site Gate 2, Vijayawada"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-amber-500/50"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Machinery dispatch transport will be routed directly to this verified job-site address.
                  </p>
                </div>

                {/* Job Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Job-Site Notes & Scope
                  </label>
                  <textarea
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Site supervisor contact, gate clearance instructions, transport access..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    to="/rentals"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={booking || calculating}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 lightable-btn cursor-pointer"
                  >
                    {booking ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing Lease...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Confirm Rental Agreement
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Calculation Preview Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6 lightable lightable-border">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 relative z-10">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Authoritative Price Preview
                </h3>
                <p className="text-[11px] text-slate-400">
                  Calculated dynamically by Rental Microservice
                </p>
              </div>
              {calculating && <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />}
            </div>

            {calcError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                {calcError}
              </div>
            )}

            {calculationResult ? (
              <div className="space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Machinery:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                      {calculationResult.equipmentName}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Authoritative Daily Rate:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      ₹{Number(calculationResult.dailyRate).toLocaleString("en-IN")} / day
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Calculated Duration:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                      {calculationResult.durationDays} day(s)
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                    Estimated Rental Total
                  </span>
                  <div className="flex items-center text-2xl font-black text-slate-900 dark:text-slate-100">
                    <span className="text-amber-500 mr-1">₹</span>
                    <span>
                      {Number(calculationResult.estimatedTotal).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>State locked as RESERVED immediately on confirmation</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                <Clock className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 stroke-[1.5]" />
                <p>Select machinery and lease dates to preview verified rate calculation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookRental;
