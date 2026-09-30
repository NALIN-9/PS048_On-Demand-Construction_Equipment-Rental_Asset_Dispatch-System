import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosClient from "../../api/axiosClient";
import EquipmentCard from "../../components/equipment/EquipmentCard";
import EmptyState from "../../components/ui/EmptyState";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Notification from "../../components/ui/Notification";
import Modal from "../../components/ui/Modal";
import { CardSkeleton } from "../../components/ui/LoadingSkeleton";
import {
  Tractor,
  Plus,
  Search,
  Filter,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

const EquipmentList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ROLE_ADMIN";
  const [searchParams, setSearchParams] = useSearchParams();
  const initialKeyword = searchParams.get("keyword") || "";

  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);

  // Filters
  const [keyword, setKeyword] = useState(initialKeyword);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [locationFilter, setLocationFilter] = useState("");

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const categories = [
    "ALL",
    "Excavator",
    "Bulldozer",
    "Crane",
    "Dump Truck",
    "Backhoe Loader",
    "Compactor",
    "Motor Grader",
    "Wheel Loader",
  ];

  const statuses = [
    { label: "All Statuses", value: "ALL" },
    { label: "Available", value: "AVAILABLE" },
    { label: "Reserved", value: "RESERVED" },
    { label: "Dispatched", value: "DISPATCHED" },
    { label: "In Use", value: "IN_USE" },
    { label: "Returned", value: "RETURNED" },
    { label: "Maintenance", value: "MAINTENANCE" },
  ];

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (categoryFilter !== "ALL") params.category = categoryFilter;
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (locationFilter.trim()) params.location = locationFilter.trim();
      if (keyword.trim()) params.keyword = keyword.trim();

      const response = await axiosClient.get("/api/equipment", { params });
      setEquipmentList(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load fleet inventory. Please verify Equipment Service status."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [categoryFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEquipment();
  };

  const handleResetFilters = () => {
    setKeyword("");
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setLocationFilter("");
    setSearchParams({});
    setTimeout(() => {
      fetchEquipment();
    }, 0);
  };

  const promptDelete = (id) => {
    const item = equipmentList.find((e) => e.id === id);
    setEquipmentToDelete(item || { id });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!equipmentToDelete) return;
    try {
      setDeleting(true);
      await axiosClient.delete(`/api/equipment/${equipmentToDelete.id}`);
      setNotification({
        type: "success",
        message: `Equipment ${equipmentToDelete.name || ""} deleted successfully.`,
      });
      setDeleteModalOpen(false);
      setEquipmentToDelete(null);
      fetchEquipment();
    } catch (err) {
      setNotification({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to delete equipment. It may be linked to an active rental.",
      });
    } finally {
      setDeleting(false);
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Tractor className="w-7 h-7 text-amber-500" />
            Heavy Equipment Fleet
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time machinery directory, specifications, and availability management
          </p>
        </div>

        {isAdmin && (
          <Link
            to="/equipment/add"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md hover:shadow-lg hover:scale-[1.02] transition-all lightable-btn cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Equipment
          </Link>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 lightable lightable-border">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 relative z-10">
          {/* Keyword Search */}
          <div className="relative md:col-span-4">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by name, model, code..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Location Search */}
          <div className="md:col-span-3">
            <input
              type="text"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="Filter by location yard..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "ALL" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="md:col-span-2 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-sm lightable-btn cursor-pointer"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-all cursor-pointer"
              title="Reset Filters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Status Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800/80 scrollbar-none relative z-10">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <SlidersHorizontal className="w-3 h-3" />
            Status:
          </span>
          {statuses.map((st) => (
            <button
              key={st.value}
              onClick={() => setStatusFilter(st.value)}
              type="button"
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === st.value
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && <ErrorMessage message={error} onRetry={fetchEquipment} />}

      {/* Equipment Grid or Empty State */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : equipmentList.length === 0 ? (
        <EmptyState
          icon={Tractor}
          title="No equipment found"
          description="Your equipment fleet search returned 0 records. Try adjusting filters or check back later."
          actionLabel={isAdmin ? "Add Equipment" : undefined}
          actionLink={isAdmin ? "/equipment/add" : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {equipmentList.map((eq) => (
            <EquipmentCard key={eq.id} equipment={eq} onDelete={isAdmin ? promptDelete : null} />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal (ADMIN only) */}
      {isAdmin && (
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Confirm Equipment Deletion"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to permanently delete machinery asset{" "}
              <strong className="text-slate-900 dark:text-slate-100 font-bold">
                {equipmentToDelete?.name} ({equipmentToDelete?.equipmentCode})
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EquipmentList;
