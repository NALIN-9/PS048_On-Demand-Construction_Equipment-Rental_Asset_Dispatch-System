import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import Notification from "../../components/ui/Notification";
import { Truck, ArrowLeft, Plus, MapPin, ShieldCheck, CheckCircle2, Lock } from "lucide-react";

const CreateDispatch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRentalId = searchParams.get("rentalId") || "";
  const initialEquipmentId = searchParams.get("equipmentId") || "";
  const initialContractorId = searchParams.get("contractorId") || "";

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [rentals, setRentals] = useState([]);
  const [selectedRental, setSelectedRental] = useState(null);

  const [formData, setFormData] = useState({
    rentalId: initialRentalId,
    equipmentId: initialEquipmentId,
    contractorId: initialContractorId,
    jobSiteAddress: "",
    dispatchDate: new Date().toISOString().split("T")[0],
    expectedReturnDate: "",
    operatorName: "",
    carrierName: "",
    notes: "",
  });

  const applyRentalToForm = (r) => {
    if (!r) return;
    setSelectedRental(r);
    const address =
      r.deliveryAddress ||
      r.jobSiteAddress ||
      r.jobSite ||
      r.notes ||
      `Contractor #${r.contractorId} Primary Site`;

    setFormData((prev) => ({
      ...prev,
      rentalId: r.id,
      equipmentId: r.equipmentId,
      contractorId: r.contractorId,
      jobSiteAddress: address,
      dispatchDate: r.startDate || prev.dispatchDate || new Date().toISOString().split("T")[0],
      expectedReturnDate: r.endDate || prev.expectedReturnDate || "",
    }));
  };

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const response = await axiosClient.get("/api/rentals");
        const list = response.data || [];
        setRentals(list);

        if (initialRentalId) {
          const match = list.find((item) => String(item.id) === String(initialRentalId));
          if (match) {
            applyRentalToForm(match);
          } else {
            // Fetch single rental
            try {
              const single = await axiosClient.get(`/api/rentals/${initialRentalId}`);
              if (single.data) {
                applyRentalToForm(single.data);
              }
            } catch (ignored) {}
          }
        }
      } catch (err) {
        console.warn("Could not load rentals list", err);
      }
    };
    fetchRentals();
  }, [initialRentalId]);

  const handleRentalSelect = (e) => {
    const selectedId = e.target.value;
    const r = rentals.find((item) => String(item.id) === String(selectedId));
    if (r) {
      applyRentalToForm(r);
    } else {
      setSelectedRental(null);
      setFormData((prev) => ({
        ...prev,
        rentalId: selectedId,
        jobSiteAddress: "",
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.rentalId) {
      setNotification({
        type: "error",
        message: "Please select a confirmed rental agreement.",
      });
      return;
    }
    if (!formData.jobSiteAddress) {
      setNotification({
        type: "error",
        message: "A verified Job-Site Delivery Address is required from the rental booking.",
      });
      return;
    }

    try {
      setLoading(true);

      // Format ISO OffsetDateTime strings to ensure seamless frontend/backend date-time synchronization
      const formattedDispatchDate = formData.dispatchDate
        ? (formData.dispatchDate.includes("T") ? formData.dispatchDate : `${formData.dispatchDate}T00:00:00Z`)
        : new Date().toISOString();

      const formattedExpectedReturn = formData.expectedReturnDate
        ? (formData.expectedReturnDate.includes("T") ? formData.expectedReturnDate : `${formData.expectedReturnDate}T23:59:59Z`)
        : formattedDispatchDate;

      const payload = {
        rentalId: parseInt(formData.rentalId, 10),
        equipmentId: parseInt(formData.equipmentId, 10),
        contractorId: parseInt(formData.contractorId, 10),
        jobSite: formData.jobSiteAddress,
        jobSiteAddress: formData.jobSiteAddress,
        dispatchDate: formattedDispatchDate,
        expectedReturnDate: formattedExpectedReturn,
        operatorName: formData.operatorName,
        carrierName: formData.carrierName,
        notes: formData.notes,
        status: "PLANNED",
      };

      const res = await axiosClient.post("/api/dispatch", payload);
      setNotification({
        type: "success",
        message: "Dispatch order successfully created with verified job-site address!",
      });
      setTimeout(() => {
        navigate(`/dispatch/${res.data.id}`);
      }, 1000);
    } catch (err) {
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to create dispatch schedule.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <Link
          to="/dispatch"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-500"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dispatch Board
        </Link>
      </div>

      <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6 lightable lightable-border">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
            <Truck className="w-4 h-4" />
            Heavy Equipment Transport
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Create Dispatch Order
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Schedule machinery deployment to job-site with operator and tracking details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Associated Rental Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Link Confirmed Rental Contract <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.rentalId}
              onChange={handleRentalSelect}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="">Select Rental Contract</option>
              {rentals.map((r) => (
                <option key={r.id} value={r.id}>
                  RNT-{String(r.id).padStart(4, "0")} — {r.equipmentName} ({r.contractorName})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Equipment Asset ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="equipmentId"
                required
                value={formData.equipmentId}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contractor ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="contractorId"
                required
                value={formData.contractorId}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Job-Site Delivery Address - Verified from Confirmed Rental Booking */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                Job-Site Delivery Address <span className="text-rose-500">*</span>
              </label>
              {formData.rentalId && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  VERIFIED FROM RENTAL #{formData.rentalId}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                name="jobSiteAddress"
                required
                readOnly
                value={formData.jobSiteAddress}
                placeholder={formData.rentalId ? "No address specified in rental agreement" : "Select a confirmed rental contract above to load job-site address"}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold text-slate-900 dark:text-slate-100 cursor-not-allowed focus:outline-none"
              />
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Job-site delivery address is locked to the contractor's confirmed lease agreement. Operator verifies this destination for transit.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Dispatch Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="dispatchDate"
                required
                value={formData.dispatchDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Expected Return Date
              </label>
              <input
                type="date"
                name="expectedReturnDate"
                value={formData.expectedReturnDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Certified Machine Operator Name
              </label>
              <input
                type="text"
                name="operatorName"
                value={formData.operatorName}
                onChange={handleChange}
                placeholder="e.g. Rajesh Kumar"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Heavy Trailer Carrier / Flatbed
              </label>
              <input
                type="text"
                name="carrierName"
                value={formData.carrierName}
                onChange={handleChange}
                placeholder="e.g. Apex Heavy Transport (Trailer #9910)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Dispatch Instructions
            </label>
            <textarea
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Transport route, access permit, offloading protocol..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/dispatch"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 lightable-btn cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {loading ? "Initializing..." : "Create Dispatch Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDispatch;
