import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { TableRowSkeleton } from "../../components/ui/LoadingSkeleton";
import {
  CalendarDays,
  Plus,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

const RentalList = () => {
  const { user } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const canBookRental = user?.role === "ROLE_ADMIN" || user?.role === "ROLE_CONTRACTOR";

  const statuses = [
    { label: "All Agreements", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Confirmed", value: "CONFIRMED" },
    { label: "Active", value: "ACTIVE" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  const fetchRentals = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (user?.role === "ROLE_CONTRACTOR" && user?.userId) {
        params.contractorId = user.userId;
      }

      const response = await axiosClient.get("/api/rentals", { params });
      setRentals(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load rental agreements."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, [statusFilter, user?.userId, user?.role]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <CalendarDays className="w-7 h-7 text-amber-500" />
            Equipment Rental Contracts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Authoritative machinery lease ledger, active duration schedules, and billing
          </p>
        </div>

        {canBookRental && (
          <Link
            to="/rentals/book"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md hover:shadow-lg hover:scale-[1.02] transition-all lightable-btn cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Book Rental Agreement
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between lightable lightable-border">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none relative z-10">
          {statuses.map((st) => (
            <button
              key={st.value}
              onClick={() => setStatusFilter(st.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st.value
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <button
          onClick={fetchRentals}
          title="Refresh"
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 relative z-10 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchRentals} />}

      {/* Rental Table or Empty State */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden lightable lightable-border">
        {loading ? (
          <div className="p-8">
            <TableRowSkeleton rows={5} cols={6} />
          </div>
        ) : rentals.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No rental contracts found"
            description="There are currently no equipment rental agreements in the platform."
            actionLabel={canBookRental ? "Book Equipment Rental" : undefined}
            actionLink={canBookRental ? "/rentals/book" : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Contract #</th>
                  <th className="py-3 px-4">Machinery Asset</th>
                  <th className="py-3 px-4">Contractor</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rentals.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-4 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      RNT-{String(r.id).padStart(4, "0")}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {r.equipmentName || `Equipment #${r.equipmentId}`}
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                      {r.contractorName || `Contractor #${r.contractorId}`}
                    </td>
                    <td className="py-4 px-4 text-slate-500">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {r.startDate} → {r.endDate}
                      </div>
                      <div className="text-[10px] text-amber-500 font-mono">
                        {r.durationDays} day(s)
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                      ₹{Number(r.totalAmount || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/rentals/${r.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs transition-colors"
                      >
                        Details
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalList;
