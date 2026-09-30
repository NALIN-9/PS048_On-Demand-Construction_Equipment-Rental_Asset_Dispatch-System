import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/ui/StatusBadge";
import Notification from "../../components/ui/Notification";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Modal from "../../components/ui/Modal";
import {
  Truck,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  History,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  Building2,
  Phone,
  Mail,
  FileText,
} from "lucide-react";

const DispatchDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const role = user?.role || "";
  const isContractor = role === "ROLE_CONTRACTOR" || role === "CONTRACTOR";
  const isOperator = role === "ROLE_OPERATOR" || role === "OPERATOR";
  const isAdmin = role === "ROLE_ADMIN" || role === "ADMIN";
  const canManageDispatch = (isAdmin || isOperator) && !isContractor;

  const navigate = useNavigate();
  const [dispatch, setDispatch] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Assign Operator State (Admin Only)
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [operatorsList, setOperatorsList] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState("");
  const [savingOperator, setSavingOperator] = useState(false);

  const stages = [
    "PLANNED",
    "DISPATCHED",
    "IN_TRANSIT",
    "ARRIVED",
    "IN_USE",
    "RETURNED",
  ];

  const fetchDispatch = async () => {
    try {
      setLoading(true);
      setError("");
      const [dispatchRes, historyRes] = await Promise.allSettled([
        axiosClient.get(`/api/dispatch/${id}`),
        axiosClient.get(`/api/dispatch/${id}/history`),
      ]);
      if (dispatchRes.status === "fulfilled") {
        setDispatch(dispatchRes.value.data);
      } else {
        throw dispatchRes.reason;
      }
      if (historyRes.status === "fulfilled" && Array.isArray(historyRes.value.data)) {
        setHistory(historyRes.value.data);
      } else {
        setHistory([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load dispatch telemetry record."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchOperators = async () => {
    if (!isAdmin) return;
    try {
      const res = await axiosClient.get("/api/auth/operators").catch(() =>
        axiosClient.get("/api/auth/users", { params: { role: "ROLE_OPERATOR" } })
      );
      if (res.data && Array.isArray(res.data)) {
        setOperatorsList(res.data);
      }
    } catch (ignored) {
      // Fallback if endpoint not available
    }
  };

  useEffect(() => {
    fetchDispatch();
    if (isAdmin) {
      fetchOperators();
    }
  }, [id, isAdmin]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      const res = await axiosClient.patch(`/api/dispatch/${id}/status`, {
        status: newStatus,
        reason: `Status advanced to ${newStatus}`,
        changedBy: user?.fullName || user?.username || "OPERATIONS",
      }, {
        params: { status: newStatus }
      });

      if (res.data) {
        setDispatch(res.data);
      }
      setNotification({
        type: "success",
        message: `Dispatch #${id} advanced to ${newStatus.replace(/_/g, " ")}. Equipment state synchronized.`,
      });
      fetchDispatch();
    } catch (err) {
      setNotification({
        type: "error",
        message: err.response?.data?.message || err.message || "Failed to transition status.",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignOperator = async (e) => {
    e.preventDefault();
    if (!selectedOperator) return;

    try {
      setSavingOperator(true);
      const res = await axiosClient.patch(`/api/dispatch/${id}/assign-operator`, {
        operatorName: selectedOperator,
      }, {
        params: { operatorName: selectedOperator }
      }).catch(() =>
        axiosClient.put(`/api/dispatch/${id}`, {
          operatorName: selectedOperator,
        })
      );

      if (res.data) {
        setDispatch(res.data);
      }
      setNotification({
        type: "success",
        message: `Operator "${selectedOperator}" assigned to Dispatch #${id} successfully.`,
      });
      setAssignModalOpen(false);
      fetchDispatch();
    } catch (err) {
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to assign operator.",
      });
    } finally {
      setSavingOperator(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-500 mt-4">Loading dispatch telemetry...</p>
      </div>
    );
  }

  if (error || !dispatch) {
    return (
      <div className="space-y-4">
        <Link
          to="/dispatch"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-500"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dispatch Board
        </Link>
        <ErrorMessage message={error || "Dispatch record not found."} onRetry={fetchDispatch} />
      </div>
    );
  }

  const currentIdx = stages.indexOf(dispatch.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link
          to="/dispatch"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dispatch Board
        </Link>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => {
                setSelectedOperator(dispatch.operatorName || (operatorsList[0]?.username || operatorsList[0]?.email || ""));
                setAssignModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all"
            >
              <UserCheck className="w-4 h-4 text-amber-500" />
              {dispatch.operatorName ? "Change Operator" : "Assign Operator"}
            </button>
          )}

          {canManageDispatch && currentIdx >= 0 && currentIdx < stages.length - 1 && (
            <button
              onClick={() => handleUpdateStatus(stages[currentIdx + 1])}
              disabled={updating}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all hover:scale-[1.02] lightable-btn disabled:opacity-50 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              {updating ? "Transitioning..." : `Advance → ${stages[currentIdx + 1].replace(/_/g, " ")}`}
            </button>
          )}
        </div>
      </div>

      {/* Visual Pipeline Timeline */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 lightable lightable-border">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider relative z-10">
          Machinery Operational Lifecycle
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 relative z-10">
          {stages.map((st, idx) => {
            const isCompleted = idx < currentIdx;
            const isCurrent = idx === currentIdx;

            return (
              <div
                key={st}
                className={`p-3 rounded-2xl border text-center transition-all lightable lightable-border cursor-pointer hover:scale-[1.03] ${
                  isCurrent
                    ? "bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-sm"
                    : isCompleted
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-400"
                }`}
              >
                <div className="text-[10px] font-mono mb-0.5 opacity-70 relative z-10">
                  Step 0{idx + 1}
                </div>
                <div className="text-xs relative z-10">{st.replace(/_/g, " ")}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Details & Logistics */}
      <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6 lightable lightable-border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
              <Truck className="w-4 h-4" />
              Dispatch Order
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              DSP-{String(dispatch.id).padStart(4, "0")}
            </h1>
          </div>

          <StatusBadge status={dispatch.status} size="lg" />
        </div>

        {/* Primary Identification Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Machinery Asset */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Machinery Asset</span>
            <Link
              to={`/equipment/${dispatch.equipmentId}`}
              className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-amber-500 mt-1 block truncate"
            >
              {dispatch.equipmentName || `Equipment #${dispatch.equipmentId}`}
            </Link>
            {dispatch.equipmentCode && (
              <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">{dispatch.equipmentCode}</span>
            )}
          </div>

          {/* Contractor / Ordered By */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Contractor / Ordered By</span>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 block truncate">
              {dispatch.contractorName || `Contractor #${dispatch.contractorId}`}
            </div>
            {dispatch.contractorEmail && (
              <span className="text-[10px] text-slate-400 mt-0.5 block truncate">{dispatch.contractorEmail}</span>
            )}
          </div>

          {/* Linked Rental */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Linked Rental</span>
            <Link
              to={`/rentals/${dispatch.rentalId}`}
              className="text-xs font-mono font-bold text-amber-500 hover:underline mt-1 block"
            >
              RNT-{String(dispatch.rentalId).padStart(4, "0")}
            </Link>
            {dispatch.rentalBookingReference && (
              <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">{dispatch.rentalBookingReference}</span>
            )}
          </div>
        </div>

        {/* Transport, Schedule & Operator Specs */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-start gap-2 text-xs">
            <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">Verified Job-Site Delivery Address:</span>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">{dispatch.jobSiteAddress || dispatch.jobSite || "—"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-200/50 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Dispatch Date:</span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                {dispatch.dispatchDate ? dispatch.dispatchDate.split("T")[0] : "—"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Expected Return:</span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                {dispatch.expectedReturnDate ? dispatch.expectedReturnDate.split("T")[0] : "—"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Assigned Operator:</span>
              <span className={`font-bold ${dispatch.operatorName ? "text-slate-800 dark:text-slate-200" : "text-amber-500"}`}>
                {dispatch.operatorName || "Not Assigned"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Carrier Trailer:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{dispatch.carrierName || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status History Audit Trail */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-amber-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Dispatch Audit Log & Timeline
          </h2>
        </div>

        {(!history || history.length === 0) ? (
          <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            Initial dispatch state recorded.
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((h, i) => (
              <div
                key={h.id || i}
                className="flex items-start justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-3">
                  <StatusBadge status={h.newStatus || h.status} size="sm" />
                  <div>
                    <span className="text-slate-700 dark:text-slate-200 font-medium block">
                      {h.changeReason || h.notes || `Status advanced to ${(h.newStatus || h.status || "").replace(/_/g, " ")}`}
                    </span>
                    {h.changedBy && (
                      <span className="text-[10px] text-slate-400">By: {h.changedBy}</span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {h.recordedAt ? new Date(h.recordedAt).toLocaleString() : h.changedAt || "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Operator Modal for Admin */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Machine Operator"
      >
        <form onSubmit={handleAssignOperator} className="space-y-4">
          <p className="text-xs text-slate-500">
            Assign a qualified equipment operator for Dispatch <strong>DSP-{String(dispatch.id).padStart(4, "0")}</strong>.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Operator
            </label>
            {operatorsList.length > 0 ? (
              <select
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- Choose Operator --</option>
                {operatorsList.map((op) => (
                  <option key={op.id || op.username} value={op.fullName || op.username || op.email}>
                    {op.fullName ? `${op.fullName} (${op.email || op.username})` : (op.email || op.username)}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value)}
                placeholder="e.g. operator@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingOperator || !selectedOperator}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              {savingOperator ? "Saving..." : "Save Assignment"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DispatchDetails;

