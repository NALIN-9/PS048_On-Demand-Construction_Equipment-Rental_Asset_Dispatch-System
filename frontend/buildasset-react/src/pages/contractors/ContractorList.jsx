import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Notification from "../../components/ui/Notification";
import Modal from "../../components/ui/Modal";
import { TableRowSkeleton } from "../../components/ui/LoadingSkeleton";
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Building,
  Trash2,
  Edit,
  ShieldCheck,
} from "lucide-react";

const ContractorList = () => {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [notification, setNotification] = useState(null);

  // Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    username: "",
    businessLicenseNumber: "",
    taxId: "",
  });

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contractorToDelete, setContractorToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchContractors = async () => {
    try {
      setLoading(true);
      setError("");
      const params = keyword.trim() ? { keyword: keyword.trim() } : {};
      const res = await axiosClient.get("/api/contractors", { params });
      setContractors(res.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load contractor profiles."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractors();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchContractors();
  };

  const openAddModal = () => {
    setEditingContractor(null);
    setFormData({
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      username: "",
      businessLicenseNumber: "",
      taxId: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingContractor(c);
    setFormData({
      companyName: c.companyName || "",
      contactPerson: c.contactPerson || "",
      email: c.email || "",
      phone: c.phone || "",
      address: c.address || "",
      username: c.username || "",
      businessLicenseNumber: c.businessLicenseNumber || "",
      taxId: c.taxId || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingContractor) {
        await axiosClient.put(`/api/contractors/${editingContractor.id}`, formData);
        setNotification({
          type: "success",
          message: "Contractor company profile updated.",
        });
      } else {
        await axiosClient.post("/api/contractors", formData);
        setNotification({
          type: "success",
          message: "Contractor registered successfully.",
        });
      }
      setModalOpen(false);
      fetchContractors();
    } catch (err) {
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to save contractor profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  const promptDelete = (c) => {
    setContractorToDelete(c);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!contractorToDelete) return;
    try {
      setDeleting(true);
      await axiosClient.delete(`/api/contractors/${contractorToDelete.id}`);
      setNotification({
        type: "success",
        message: "Contractor record deleted.",
      });
      setDeleteModalOpen(false);
      fetchContractors();
    } catch (err) {
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Cannot delete contractor with active rentals.",
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-amber-500" />
            Contractor Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Registered construction firms, site accounts, and verified enterprise clients
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md lightable-btn hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            Register Contractor
          </button>
          <button
            onClick={fetchContractors}
            title="Refresh"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 lightable-btn transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/90 shadow-sm lightable lightable-border flex items-center gap-3">
        <div className="relative flex-1 z-10">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search contractor company by name, email, contact person..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs lightable-btn hover:scale-[1.02] active:scale-[0.98] relative z-10 transition-all"
        >
          Search
        </button>
      </form>

      {error && <ErrorMessage message={error} onRetry={fetchContractors} />}

      {/* Contractors Table */}
      <div className="p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/90 shadow-sm lightable lightable-border overflow-hidden">
        {loading ? (
          <div className="relative z-10">
            <TableRowSkeleton rows={4} cols={5} />
          </div>
        ) : contractors.length === 0 ? (
          <div className="relative z-10">
            <EmptyState
              icon={Users}
              title="No contractors found"
              description="Your contractor directory currently has no registered firms."
              actionLabel="Register Contractor"
              onAction={openAddModal}
            />
          </div>
        ) : (
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {contractors.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {c.companyName}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {c.businessLicenseNumber || `ID: #${c.id}`}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {c.contactPerson}
                    </td>
                    <td className="py-4 px-4 text-slate-500">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{c.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-500">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{c.phone || "—"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={c.status || "ACTIVE"} size="sm" />
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => promptDelete(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingContractor ? "Edit Contractor Profile" : "Register Contractor Firm"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. Apex Infra Corp"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Primary Contact Person <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="e.g. Vikram Singhania"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@apexinfra.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Registered Office Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Plot 42, Industrial Area, Sector 5"
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
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Contractor Profile"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Contractor Deletion"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to delete contractor{" "}
            <strong>{contractorToDelete?.companyName}</strong>?
          </p>
          <div className="flex justify-end gap-3 pt-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Confirm Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ContractorList;
