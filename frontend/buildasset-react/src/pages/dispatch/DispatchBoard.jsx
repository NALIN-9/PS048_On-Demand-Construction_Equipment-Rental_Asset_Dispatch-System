import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosClient from "../../api/axiosClient";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Notification from "../../components/ui/Notification";
import { CardSkeleton } from "../../components/ui/LoadingSkeleton";
import {
  Truck,
  Plus,
  ArrowRight,
  RefreshCw,
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
} from "lucide-react";

const DispatchBoard = () => {
  const { user } = useAuth();
  const role = user?.role || "";
  const isContractor = role === "ROLE_CONTRACTOR" || role === "CONTRACTOR";
  const isOperator = role === "ROLE_OPERATOR" || role === "OPERATOR";
  const isAdmin = role === "ROLE_ADMIN" || role === "ADMIN";
  const canManageDispatch = isAdmin || isOperator;

  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [advancingId, setAdvancingId] = useState(null);

  const stages = [
    "PLANNED",
    "DISPATCHED",
    "IN_TRANSIT",
    "ARRIVED",
    "IN_USE",
    "RETURNED",
  ];

  const fetchDispatches = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (isContractor && user?.userId) {
        params.contractorId = user.userId;
      }
      const response = await axiosClient.get("/api/dispatches", { params }).catch(() =>
        axiosClient.get("/api/dispatch", { params })
      );
      setDispatches(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load dispatch telemetry board."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispatches();
  }, []);

  const getNextStage = (current) => {
    const idx = stages.indexOf(current);
    if (idx >= 0 && idx < stages.length - 1) {
      return stages[idx + 1];
    }
    return null;
  };

  const handleAdvanceStatus = async (dispatchId, currentStatus) => {
    const next = getNextStage(currentStatus);
    if (!next) return;

    try {
      setAdvancingId(dispatchId);
      const res = await axiosClient.patch(`/api/dispatch/${dispatchId}/status`, {
        status: next,
        reason: `Status advanced to ${next}`,
        changedBy: user?.fullName || user?.username || "OPERATIONS",
      }, {
        params: { status: next }
      });

      if (res.data) {
        setDispatches((prev) =>
          prev.map((d) => (d.id === dispatchId ? res.data : d))
        );
      }
      setNotification({
        type: "success",
        message: `Dispatch #${dispatchId} advanced from ${currentStatus.replace(/_/g, " ")} to ${next.replace(/_/g, " ")}. Equipment state synchronized.`,
      });
      fetchDispatches();
    } catch (err) {
      setNotification({
        type: "error",
        message: err.response?.data?.message || err.message || "Failed to update dispatch status.",
      });
    } finally {
      setAdvancingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-amber-500" />
            Heavy Machinery Dispatch Board
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Job-site transport logistics, active operator routes, and machine lifecycle pipeline
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManageDispatch && (
            <Link
              to="/dispatch/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Dispatch Order
            </Link>
          )}
          <button
            onClick={fetchDispatches}
            title="Refresh Board"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lifecycle Flow Legend */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px] text-xs">
          {stages.map((stage, idx) => (
            <React.Fragment key={stage}>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-bold text-[10px] flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                  {stage.replace(/_/g, " ")}
                </span>
              </div>
              {idx < stages.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-700" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchDispatches} />}

      {/* Dispatch Cards Grid */}
      {loading ? (
        <CardSkeleton count={3} />
      ) : dispatches.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No active dispatches"
          description="There are currently no machinery transport or deployment orders active."
          actionLabel={canManageDispatch ? "Create Dispatch Order" : undefined}
          actionLink={canManageDispatch ? "/dispatch/create" : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dispatches.map((d) => {
            const nextStage = getNextStage(d.status);
            const isAdvancing = advancingId === d.id;

            return (
              <div
                key={d.id}
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all p-6 flex flex-col justify-between space-y-4 lightable lightable-border cursor-pointer group"
              >
                <div className="space-y-3 relative z-10">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/dispatch/${d.id}`}
                          className="text-[10px] font-mono font-bold text-amber-500 hover:text-amber-400 uppercase tracking-wider block hover:underline"
                          title="View Dispatch Order Details"
                        >
                          DSP-{String(d.id).padStart(4, "0")}
                        </Link>
                        {d.rentalId && (
                          <Link
                            to={`/rentals/${d.rentalId}`}
                            className="text-[10px] font-mono text-slate-400 hover:text-amber-500"
                            title="Linked Rental Contract"
                          >
                            • RNT-{String(d.rentalId).padStart(4, "0")}
                          </Link>
                        )}
                      </div>
                      <Link
                        to={`/dispatch/${d.id}`}
                        className="group"
                      >
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5 group-hover:text-amber-500 transition-colors">
                          {d.equipmentName || `Equipment #${d.equipmentId}`}
                        </h3>
                      </Link>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                        <span className="text-slate-400 font-normal">Ordered by: </span>
                        {d.contractorName || `Contractor #${d.contractorId}`}
                      </p>
                    </div>
                    <StatusBadge status={d.status} size="sm" />
                  </div>

                  {/* Destination / Job-site */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold truncate">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{d.jobSiteAddress || d.jobSite || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          Operator:{" "}
                          <strong className={d.operatorName ? "text-slate-700 dark:text-slate-200" : "text-amber-500 font-normal"}>
                            {d.operatorName || "Not Assigned"}
                          </strong>
                        </span>
                      </span>
                      {d.dispatchDate && (
                        <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                          <Calendar className="w-3 h-3 text-amber-500" />
                          {d.dispatchDate.split("T")[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 relative z-10">
                  <Link
                    to={`/dispatch/${d.id}`}
                    className="text-xs font-bold text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 inline-flex items-center gap-1"
                  >
                    Details
                    <ArrowRight className="w-3 h-3" />
                  </Link>

                  {canManageDispatch && nextStage ? (
                    <button
                      onClick={() => handleAdvanceStatus(d.id, d.status)}
                      disabled={isAdvancing}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm hover:scale-[1.02] transition-all disabled:opacity-50 lightable-btn cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      {isAdvancing ? "Updating..." : `Advance → ${nextStage.replace(/_/g, " ")}`}
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                      {d.status === "RETURNED" ? "Asset Returned" : "Phase Active"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DispatchBoard;
