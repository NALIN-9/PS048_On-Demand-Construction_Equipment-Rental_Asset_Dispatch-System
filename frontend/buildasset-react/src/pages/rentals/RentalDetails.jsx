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
  CalendarDays,
  ArrowLeft,
  Calendar,
  Tractor,
  Users,
  IndianRupee,
  Truck,
  CheckCircle2,
  Trash2,
  Clock,
  ShieldCheck,
} from "lucide-react";

const RentalDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);

  const canInitiateDispatch =
    (user?.role === "ROLE_ADMIN" || user?.role === "ROLE_OPERATOR") &&
    rental?.status === "CONFIRMED";

  const canDelete =
    user?.role === "ROLE_ADMIN" ||
    (user?.role === "ROLE_CONTRACTOR" &&
      (!rental?.contractorId || user?.userId === rental?.contractorId));

  // Delete / Cancel Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchRental = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosClient.get(`/api/rentals/${id}`);
      setRental(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load rental agreement details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRental();
  }, [id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axiosClient.delete(`/api/rentals/${id}`);
      navigate("/rentals");
    } catch (err) {
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to cancel rental agreement.",
      });
      setDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-500 mt-4">Loading rental contract...</p>
      </div>
    );
  }

  if (error || !rental) {
    return (
      <div className="space-y-4">
        <Link
          to="/rentals"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-500"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Rental Contracts
        </Link>
        <ErrorMessage message={error || "Rental not found."} onRetry={fetchRental} />
      </div>
    );
  }

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
          to="/rentals"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Rental Agreements
        </Link>

        <div className="flex items-center gap-2">
          {canInitiateDispatch && (
            <Link
              to={`/dispatch/create?rentalId=${rental.id}&equipmentId=${rental.equipmentId}&contractorId=${rental.contractorId}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
            >
              <Truck className="w-4 h-4" />
              Initiate Dispatch
            </Link>
          )}

          {canDelete && (
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20"
              title="Cancel / Delete Agreement"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Contract Detail Card */}
      <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6 lightable lightable-border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
              <CalendarDays className="w-4 h-4" />
              Rental Contract
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              Agreement #{String(rental.id).padStart(4, "0")}
            </h1>
          </div>

          <StatusBadge status={rental.status} size="lg" />
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 lightable lightable-border hover:scale-[1.02] transition-all cursor-default">
            <span className="text-[10px] font-bold uppercase text-slate-400 block relative z-10">Machinery Asset</span>
            <Link
              to={`/equipment/${rental.equipmentId}`}
              className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-amber-500 mt-1 block truncate relative z-10"
            >
              {rental.equipmentName || `Equipment #${rental.equipmentId}`}
            </Link>
            {rental.equipmentCode && (
              <span className="text-[10px] font-mono text-slate-400 mt-0.5 block relative z-10">{rental.equipmentCode}</span>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 lightable lightable-border hover:scale-[1.02] transition-all cursor-default">
            <span className="text-[10px] font-bold uppercase text-slate-400 block relative z-10">Ordered By / Contractor</span>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 block truncate relative z-10">
              {rental.contractorName || `Contractor #${rental.contractorId}`}
            </div>
            {rental.contractorEmail && (
              <span className="text-[10px] text-slate-400 mt-0.5 block truncate relative z-10">{rental.contractorEmail}</span>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 lightable lightable-border hover:scale-[1.02] transition-all cursor-default">
            <span className="text-[10px] font-bold uppercase text-slate-400 block relative z-10">Daily Rate</span>
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 mt-1 block relative z-10">
              ₹{Number(rental.dailyRate || 0).toLocaleString("en-IN")}/day
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 lightable lightable-border hover:scale-[1.02] transition-all cursor-default">
            <span className="text-[10px] font-bold uppercase text-slate-400 block relative z-10">Duration</span>
            <span className="text-xs font-mono font-bold text-amber-500 mt-1 block relative z-10">
              {rental.durationDays} day(s)
            </span>
          </div>
        </div>

        {/* Schedule & Total Amount Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2 lightable lightable-border">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block relative z-10">
              Lease Schedule
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 relative z-10">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>
                <strong>Start:</strong> {rental.startDate}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 relative z-10">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>
                <strong>Return:</strong> {rental.endDate}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col justify-between lightable lightable-border">
            <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 relative z-10">
              Total Contract Amount
            </span>
            <div className="flex items-center text-3xl font-black text-slate-900 dark:text-slate-100 relative z-10">
              <span className="text-amber-500 mr-1 text-xl">₹</span>
              <span>
                {Number(rental.totalAmount || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 relative z-10">
              Duration ({rental.durationDays} days) × Daily Rate (₹{Number(rental.dailyRate || 0).toLocaleString("en-IN")})
            </span>
          </div>
        </div>

        {rental.deliveryAddress && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200 shrink-0">Job-Site Delivery Address:</span>
            <span>{rental.deliveryAddress}</span>
          </div>
        )}

        {rental.notes && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <strong>Notes:</strong> {rental.notes}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Cancel Rental Agreement"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to cancel rental contract #{rental.id}? This will release the locked machinery back to AVAILABLE.
          </p>
          <div className="flex justify-end gap-3 pt-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold disabled:opacity-50"
            >
              {deleting ? "Cancelling..." : "Confirm Cancel"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RentalDetails;
