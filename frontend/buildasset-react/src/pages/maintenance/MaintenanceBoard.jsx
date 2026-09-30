import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Notification from "../../components/ui/Notification";
import Modal from "../../components/ui/Modal";
import { TableRowSkeleton } from "../../components/ui/LoadingSkeleton";
import {
  Wrench,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const MaintenanceBoard = () => {
  const [equipmentUnderMaint, setEquipmentUnderMaint] = useState([]);
  const [allEquipment, setAllEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [maintForm, setMaintForm] = useState({
    equipmentId: "",
    maintenanceType: "ROUTINE_SERVICE",
    scheduledDate: new Date().toISOString().split("T")[0],
    description: "",
    cost: "",
  });

  const fetchMaintenanceData = async () => {
    try {
      setLoading(true);
      setError("");

      const [maintRes, allRes] = await Promise.allSettled([
        axiosClient.get("/api/equipment", { params: { status: "MAINTENANCE" } }),
        axiosClient.get("/api/equipment"),
      ]);

      if (maintRes.status === "fulfilled") {
        setEquipmentUnderMaint(maintRes.value.data || []);
      }
      if (allRes.status === "fulfilled") {
        setAllEquipment(allRes.value.data || []);
        if (allRes.value.data?.length > 0 && !maintForm.equipmentId) {
          setMaintForm((prev) => ({ ...prev, equipmentId: allRes.value.data[0].id }));
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load fleet maintenance data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceData();
  }, []);

  const handleScheduleMaintenance = async (e) => {
    e.preventDefault();
    if (!maintForm.equipmentId) return;

    try {
      setSubmitting(true);
      await axiosClient.post(`/api/equipment/${maintForm.equipmentId}/maintenance`, {
        maintenanceType: maintForm.maintenanceType,
        scheduledDate: maintForm.scheduledDate,
        description: maintForm.description,
        cost: maintForm.cost ? parseFloat(maintForm.cost) : null,
      });

      setNotification({
        type: "success",
        message: "Maintenance service scheduled. Asset transitioned to MAINTENANCE.",
      });
      setModalOpen(false);
      setMaintForm({
        equipmentId: allEquipment[0]?.id || "",
        maintenanceType: "ROUTINE_SERVICE",
        scheduledDate: new Date().toISOString().split("T")[0],
        description: "",
        cost: "",
      });
      fetchMaintenanceData();
    } catch (err) {
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to schedule service.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReleaseEquipment = async (eqId) => {
    try {
      await axiosClient.patch(`/api/equipment/${eqId}/status?status=AVAILABLE`);
      setNotification({
        type: "success",
        message: "Machinery maintenance completed! Status updated to AVAILABLE.",
      });
      fetchMaintenanceData();
    } catch (err) {
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to release equipment.",
      });
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
            <Wrench className="w-7 h-7 text-orange-500" />
            Fleet Maintenance & Safety Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Preventative servicing, mechanical certifications, and active overhaul tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs shadow-md lightable-btn hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            Schedule Service
          </button>
          <button
            onClick={fetchMaintenanceData}
            title="Refresh"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 lightable-btn transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchMaintenanceData} />}

      {/* Currently In Maintenance Table */}
      <div className="p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/90 shadow-sm lightable lightable-border space-y-4">
        <div className="relative z-10">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Assets Currently Under Service / Inspection
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Machinery locked out from rental booking until maintenance release
          </p>
        </div>

        {loading ? (
          <div className="py-8 relative z-10">
            <TableRowSkeleton rows={3} cols={5} />
          </div>
        ) : equipmentUnderMaint.length === 0 ? (
          <div className="relative z-10">
            <EmptyState
              icon={Wrench}
              title="No machinery under maintenance"
              description="All fleet assets are currently operational and available for field deployment."
              actionLabel={allEquipment.length > 0 ? "Schedule Service" : undefined}
              onAction={() => setModalOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Equipment Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location Yard</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {equipmentUnderMaint.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-amber-500">
                      {eq.equipmentCode}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">
                      <Link to={`/equipment/${eq.id}`} className="hover:text-amber-500 transition-colors">
                        {eq.name}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-medium">
                      {eq.category}
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                      {eq.location || "—"}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={eq.status} size="sm" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleReleaseEquipment(eq.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm lightable-btn hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Release to Available
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Maintenance Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Schedule Fleet Maintenance Service"
      >
        <form onSubmit={handleScheduleMaintenance} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Fleet Machinery <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={maintForm.equipmentId}
              onChange={(e) => setMaintForm({ ...maintForm, equipmentId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100"
            >
              <option value="">Choose Equipment</option>
              {allEquipment.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} ({eq.equipmentCode}) — Status: {eq.status}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Service Type
              </label>
              <select
                value={maintForm.maintenanceType}
                onChange={(e) => setMaintForm({ ...maintForm, maintenanceType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-semibold"
              >
                <option value="ROUTINE_SERVICE">Routine Preventative Service</option>
                <option value="ENGINE_OVERHAUL">Engine Overhaul</option>
                <option value="HYDRAULIC_REPAIR">Hydraulic System Repair</option>
                <option value="TRACK_INSPECTION">Track / Tire Inspection</option>
                <option value="SAFETY_AUDIT">Safety Certification Audit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Scheduled Service Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={maintForm.scheduledDate}
                onChange={(e) => setMaintForm({ ...maintForm, scheduledDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Estimated Service Cost (₹)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={maintForm.cost}
              onChange={(e) => setMaintForm({ ...maintForm, cost: e.target.value })}
              placeholder="e.g. 7500.00"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Maintenance Description & Inspection Checklist
            </label>
            <textarea
              rows="3"
              value={maintForm.description}
              onChange={(e) => setMaintForm({ ...maintForm, description: e.target.value })}
              placeholder="Describe oil change, hydraulic hose replacement, safety checks..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs shadow-md disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Confirm Maintenance"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaintenanceBoard;
