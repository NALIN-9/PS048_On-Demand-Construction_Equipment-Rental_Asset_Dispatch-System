import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosClient from "../../api/axiosClient";
import StatusBadge from "../../components/ui/StatusBadge";
import Notification from "../../components/ui/Notification";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Modal from "../../components/ui/Modal";
import GoogleImagePickerModal from "../../components/equipment/GoogleImagePickerModal";
import {
  getEquipmentGallery,
  getEquipmentImage,
  CATEGORY_GALLERY_PRESETS,
  CATEGORY_IMAGE_PRESETS,
  DEFAULT_MACHINERY_IMAGE,
  getCategorySvgPlaceholder,
  compressImageFile,
  sanitizeImageUrl,
} from "../../utils/equipmentImages";
import {
  Tractor,
  ArrowLeft,
  Wrench,
  Edit,
  Trash2,
  CalendarCheck,
  Plus,
  CalendarDays,
  Users,
  UserCheck,
  MapPin,
  Truck,
  Building2,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Camera,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  X,
  Star,
  Search,
} from "lucide-react";

const EquipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.role === "ROLE_ADMIN";
  const isOperator = user?.role === "ROLE_OPERATOR";
  const isContractor = user?.role === "ROLE_CONTRACTOR";
  const canManageMaint = isAdmin || isOperator;

  const [equipment, setEquipment] = useState(null);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);

  // Gallery Navigation State
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Photo Update Modal State
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [modalPhotos, setModalPhotos] = useState([]);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [updatingPhoto, setUpdatingPhoto] = useState(false);

  // Maintenance Schedule Modal State
  const [maintModalOpen, setMaintModalOpen] = useState(false);
  const [maintForm, setMaintForm] = useState({
    maintenanceType: "ROUTINE_SERVICE",
    scheduledDate: new Date().toISOString().split("T")[0],
    description: "",
    cost: "",
  });
  const [schedulingMaint, setSchedulingMaint] = useState(false);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchEquipmentDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const eqRes = await axiosClient.get(`/api/equipment/${id}`);
      setEquipment(eqRes.data);

      if (canManageMaint) {
        try {
          const logsRes = await axiosClient.get(`/api/equipment/${id}/maintenance`);
          setMaintenanceLogs(logsRes.data || []);
        } catch {
          setMaintenanceLogs([]);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load machinery asset details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipmentDetails();
  }, [id, canManageMaint]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axiosClient.delete(`/api/equipment/${id}`);
      navigate("/equipment");
    } catch (err) {
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Cannot delete equipment with active rentals.",
      });
      setDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleScheduleMaintenance = async (e) => {
    e.preventDefault();
    try {
      setSchedulingMaint(true);
      await axiosClient.post(`/api/equipment/${id}/maintenance`, {
        maintenanceType: maintForm.maintenanceType,
        scheduledDate: maintForm.scheduledDate,
        description: maintForm.description,
        cost: maintForm.cost ? parseFloat(maintForm.cost) : null,
      });

      setNotification({
        type: "success",
        message: "Maintenance service logged. Machinery transitioned to MAINTENANCE.",
      });
      setMaintModalOpen(false);
      setMaintForm({
        maintenanceType: "ROUTINE_SERVICE",
        scheduledDate: new Date().toISOString().split("T")[0],
        description: "",
        cost: "",
      });
      fetchEquipmentDetails();
    } catch (err) {
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to schedule maintenance.",
      });
    } finally {
      setSchedulingMaint(false);
    }
  };

  const handleCompleteMaintenance = async (logId) => {
    try {
      await axiosClient.patch(`/api/equipment/maintenance/${logId}/status?status=COMPLETED`);
      setNotification({
        type: "success",
        message: "Maintenance completed. Asset returned to AVAILABLE status.",
      });
      fetchEquipmentDetails();
    } catch (err) {
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to update maintenance status.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
          Loading machinery technical sheet...
        </p>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="space-y-4">
        <Link
          to="/equipment"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-500"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Equipment List
        </Link>
        <ErrorMessage message={error || "Equipment not found."} onRetry={fetchEquipmentDetails} />
      </div>
    );
  }

  const formattedRate = equipment.dailyRate != null
    ? Number(equipment.dailyRate).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";

  const gallery = getEquipmentGallery(equipment.imageUrl, equipment.category);
  const activeImage = gallery[activePhotoIndex] || gallery[0] || getEquipmentImage(equipment.imageUrl, equipment.category);

  const handleOpenPhotoModal = () => {
    setModalPhotos([...gallery]);
    setCustomUrlInput("");
    setPhotoModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      setUploadingFile(true);
      const compressedList = await Promise.all(
        files.map((f) => compressImageFile(f, 1200, 0.82))
      );
      setModalPhotos((prev) => [...prev, ...compressedList]);
    } catch (err) {
      setNotification({
        type: "error",
        message: err.message || "Failed to process image file.",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleAddCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    const cleaned = sanitizeImageUrl(customUrlInput.trim());
    if (cleaned) {
      setModalPhotos((prev) => [...prev, cleaned]);
      setCustomUrlInput("");
    }
  };

  const handleRemovePhoto = (idx) => {
    setModalPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSetPrimaryPhoto = (idx) => {
    setModalPhotos((prev) => {
      const selected = prev[idx];
      const rest = prev.filter((_, i) => i !== idx);
      return [selected, ...rest];
    });
  };

  const handleSaveGallery = async () => {
    if (modalPhotos.length === 0) {
      setNotification({
        type: "warning",
        message: "Please add at least one photo.",
      });
      return;
    }
    const finalImageUrl = modalPhotos.length === 1 ? modalPhotos[0] : JSON.stringify(modalPhotos);
    await handleUpdatePhoto(finalImageUrl);
    setActivePhotoIndex(0);
  };

  const handleUpdatePhoto = async (url) => {
    try {
      setUpdatingPhoto(true);
      const payload = {
        equipmentCode: equipment.equipmentCode,
        name: equipment.name,
        category: equipment.category || "Excavator",
        manufacturer: equipment.manufacturer || "Caterpillar",
        model: equipment.model || "Standard",
        yearOfManufacture: equipment.yearOfManufacture
          ? parseInt(equipment.yearOfManufacture, 10)
          : new Date().getFullYear(),
        dailyRate: equipment.dailyRate != null ? parseFloat(equipment.dailyRate) : 1000,
        status: equipment.status || "AVAILABLE",
        location: equipment.location || "North Yard",
        description: equipment.description || "",
        imageUrl: url,
      };
      const response = await axiosClient.put(`/api/equipment/${equipment.id}`, payload);
      setEquipment(response.data || { ...equipment, imageUrl: url });
      setNotification({
        type: "success",
        message: "Machinery gallery photos updated successfully!",
      });
      setPhotoModalOpen(false);
      fetchEquipmentDetails();
    } catch (err) {
      console.error("Failed to update photo:", err);
      setNotification({
        type: "error",
        message: err.response?.data?.message || err.message || "Failed to update equipment photo.",
      });
    } finally {
      setUpdatingPhoto(false);
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

      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link
          to="/equipment"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Fleet Directory
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {equipment.status === "AVAILABLE" && (isAdmin || isContractor) && (
            <Link
              to={`/rentals/book?equipmentId=${equipment.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              <CalendarCheck className="w-4 h-4" />
              Book Rental
            </Link>
          )}

          {canManageMaint && (
            <button
              onClick={() => setMaintModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-500/30 text-xs font-bold transition-all"
            >
              <Wrench className="w-4 h-4" />
              Schedule Service
            </button>
          )}

          {isAdmin && (
            <button
              onClick={handleOpenPhotoModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all"
              title="Upload Photos & Manage Gallery"
            >
              <Camera className="w-4 h-4 text-amber-500" />
              Upload / Photo Gallery ({gallery.length})
            </button>
          )}

          {isAdmin && (
            <Link
              to={`/equipment/edit/${equipment.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all"
            >
              <Edit className="w-4 h-4" />
              Edit Specs
            </Link>
          )}

          {isAdmin && (
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 transition-all"
              title="Delete Equipment"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Machinery Asset Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image with Hover Zoom & Multi-Photo Carousel */}
        <div className="lg:col-span-5 space-y-3">
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
            <div className="relative h-80 sm:h-96 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={`${equipment.name} - View ${activePhotoIndex + 1}`}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getCategorySvgPlaceholder(equipment.category, equipment.name || equipment.equipmentCode);
                  }}
                  className="w-full h-full object-cover object-center transition-all duration-500 ease-out group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 p-8">
                  <Tractor className="w-24 h-24 stroke-[1.2] mb-3" />
                  <span className="text-xs font-mono font-bold tracking-widest uppercase">
                    Heavy Machinery Asset
                  </span>
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-4 left-4 z-10">
                <StatusBadge status={equipment.status} size="lg" />
              </div>

              {/* Machinery Code */}
              <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-amber-400 font-mono font-bold text-xs border border-slate-700/50 shadow-md">
                {equipment.equipmentCode || `EQ-${equipment.id}`}
              </div>

              {/* Carousel Next & Prev Navigation Arrows */}
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : gallery.length - 1));
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all shadow-md z-10"
                    title="Previous Photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePhotoIndex((prev) => (prev < gallery.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all shadow-md z-10"
                    title="Next Photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Photo Counter Pill */}
                  <div className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-mono font-bold border border-slate-700/40">
                    {activePhotoIndex + 1} / {gallery.length}
                  </div>
                </>
              )}

              {/* Admin Change Photo Button Overlay */}
              {isAdmin && (
                <button
                  onClick={handleOpenPhotoModal}
                  className="absolute bottom-3 right-3 z-10 px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 backdrop-blur-md text-slate-200 text-xs font-bold border border-slate-700/50 shadow-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  Photo Options
                </button>
              )}
            </div>

            {/* Pricing Footer */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Authoritative Daily Rate
                </span>
                <div className="flex items-center text-amber-600 dark:text-amber-400 font-black text-2xl">
                  <span className="text-base mr-0.5">₹</span>
                  <span>{formattedRate}</span>
                  <span className="text-xs text-slate-400 font-normal ml-1">/day</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Location Yard
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {equipment.location || "Not Specified"}
                </span>
              </div>
            </div>
          </div>

          {/* Multi-Photo Thumbnail Strip / Carousel */}
          {gallery.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 px-1 scrollbar-none">
              {gallery.map((photoUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    activePhotoIndex === idx
                      ? "border-amber-500 ring-2 ring-amber-500/40 scale-105 shadow-md"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-400 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] text-amber-400 font-bold uppercase text-center py-0.5">
                      Main
                    </span>
                  )}
                </button>
              ))}

              {isAdmin && (
                <button
                  type="button"
                  onClick={handleOpenPhotoModal}
                  className="w-16 h-16 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 bg-slate-50 dark:bg-slate-800/60 text-slate-400 hover:text-amber-500 flex flex-col items-center justify-center gap-1 shrink-0 transition-all text-[10px] font-bold"
                  title="Add more photos"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Technical Specification Sheet */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">
                <Tractor className="w-3.5 h-3.5" />
                {equipment.category || "Heavy Machinery"}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
                {equipment.name}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {[equipment.manufacturer, equipment.model].filter(Boolean).join(" • ")}
              </p>
            </div>

            {/* Description */}
            {equipment.description && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {equipment.description}
              </div>
            )}

            {/* Detailed Spec Attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Manufacturer</span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5 block truncate">
                  {equipment.manufacturer || "N/A"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Model Number</span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5 block truncate">
                  {equipment.model || "N/A"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Year of Make</span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                  {equipment.yearOfManufacture || "N/A"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Equipment Code</span>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
                  {equipment.equipmentCode || `EQ-${equipment.id}`}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Last Serviced</span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                  {equipment.lastMaintenanceDate || "Never Recorded"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Next Service Due</span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                  {equipment.nextMaintenanceDate || "Not Scheduled"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Rental & Assignment Section */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-0.5">
              <CalendarCheck className="w-4 h-4" />
              Lease & Operational Deployment
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
              Current Rental & Assignment
            </h2>
          </div>

          {equipment.currentRentalId && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400">Lease State:</span>
              <StatusBadge status={equipment.currentRentalStatus || "CONFIRMED"} size="sm" />
            </div>
          )}
        </div>

        {!equipment.currentRentalId ? (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-1">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              No Active Rental
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              This machinery asset is currently unassigned and ready for booking.
            </p>
            <div className="flex justify-center gap-6 pt-2 text-[11px] text-slate-400">
              <span>• No Contractor Assigned</span>
              <span>• No Operator Assigned</span>
              <span>• Equipment Status: <strong className="text-emerald-500 font-bold">{equipment.status}</strong></span>
            </div>
          </div>
        ) : isContractor && equipment.contractorId && equipment.contractorId !== user?.userId ? (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Under Active Contract
            </h3>
            <p className="text-xs text-slate-500">
              This machinery is currently reserved or deployed under an active lease contract.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Contractor / Ordered By Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2 lightable lightable-border hover:scale-[1.02] transition-all cursor-default">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider relative z-10">
                <Building2 className="w-3.5 h-3.5 text-amber-500" />
                Ordered By / Contractor
              </div>
              <div className="font-bold text-xs text-slate-900 dark:text-slate-100 relative z-10">
                {equipment.contractorName || `Contractor #${equipment.contractorId}`}
              </div>
              {equipment.contractorEmail && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate relative z-10">
                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{equipment.contractorEmail}</span>
                </div>
              )}
              {equipment.contractorPhone && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 relative z-10">
                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{equipment.contractorPhone}</span>
                </div>
              )}
            </div>

            {/* Assigned Operator & Dispatch */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2 lightable lightable-border hover:scale-[1.02] transition-all cursor-default">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider relative z-10">
                <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                Assigned Operator
              </div>
              <div className="font-bold text-xs relative z-10">
                {equipment.assignedOperator ? (
                  <span className="text-slate-900 dark:text-slate-100">{equipment.assignedOperator}</span>
                ) : (
                  <span className="text-amber-500 font-bold">Not Assigned</span>
                )}
              </div>
              <div className="pt-1 flex items-center justify-between text-[11px] relative z-10">
                {equipment.currentDispatchId ? (
                  <Link
                    to={`/dispatch/${equipment.currentDispatchId}`}
                    className="font-mono font-bold text-amber-500 hover:underline inline-flex items-center gap-1"
                  >
                    <Truck className="w-3 h-3" />
                    DSP-{String(equipment.currentDispatchId).padStart(4, "0")}
                  </Link>
                ) : (
                  <span className="text-slate-400">No Dispatch Created</span>
                )}
                {equipment.currentDispatchStatus && (
                  <StatusBadge status={equipment.currentDispatchStatus} size="sm" />
                )}
              </div>
            </div>

            {/* Linked Rental Contract */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2 lightable lightable-border hover:scale-[1.02] transition-all cursor-default">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider relative z-10">
                <CalendarDays className="w-3.5 h-3.5 text-amber-500" />
                Linked Rental
              </div>
              <div className="flex items-center justify-between relative z-10">
                <Link
                  to={`/rentals/${equipment.currentRentalId}`}
                  className="font-mono font-bold text-xs text-amber-500 hover:underline"
                >
                  RNT-{String(equipment.currentRentalId).padStart(4, "0")}
                </Link>
                {equipment.currentRentalStatus && (
                  <StatusBadge status={equipment.currentRentalStatus} size="sm" />
                )}
              </div>
              {equipment.rentalStartDate && equipment.rentalEndDate && (
                <div className="text-[11px] font-mono text-slate-500 pt-1 relative z-10">
                  {String(equipment.rentalStartDate)} → {String(equipment.rentalEndDate)}
                </div>
              )}
            </div>

            {/* Job-Site Delivery Address */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2 lightable lightable-border hover:scale-[1.02] transition-all cursor-default">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider relative z-10">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                Job Site
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2 relative z-10">
                {equipment.jobSiteAddress || "No delivery address specified"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Maintenance History Table (ADMIN and OPERATOR only) */}
      {canManageMaint && (
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-orange-500" />
                Service & Maintenance History
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audit log of scheduled inspections, repairs, and preventative servicing
              </p>
            </div>

            <button
              onClick={() => setMaintModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Schedule Log
            </button>
          </div>

          {maintenanceLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              No maintenance records currently logged for this asset.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Service Type</th>
                    <th className="py-3 px-4">Scheduled Date</th>
                    <th className="py-3 px-4">Completed Date</th>
                    <th className="py-3 px-4">Cost (₹)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {maintenanceLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {log.maintenanceType?.replace(/_/g, " ")}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {log.scheduledDate || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {log.completedDate || "—"}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {log.cost != null ? `₹${Number(log.cost).toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={log.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {log.status !== "COMPLETED" && (
                          <button
                            onClick={() => handleCompleteMaintenance(log.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] shadow-sm transition-all"
                          >
                            Mark Completed
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Schedule Maintenance Modal */}
      <Modal
        isOpen={maintModalOpen}
        onClose={() => setMaintModalOpen(false)}
        title="Schedule Machinery Maintenance"
      >
        <form onSubmit={handleScheduleMaintenance} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Service Type
            </label>
            <select
              value={maintForm.maintenanceType}
              onChange={(e) => setMaintForm({ ...maintForm, maintenanceType: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
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
              Scheduled Date
            </label>
            <input
              type="date"
              required
              value={maintForm.scheduledDate}
              onChange={(e) => setMaintForm({ ...maintForm, scheduledDate: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Estimated Cost (₹)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={maintForm.cost}
              onChange={(e) => setMaintForm({ ...maintForm, cost: e.target.value })}
              placeholder="e.g. 5000.00"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Notes & Description
            </label>
            <textarea
              rows="3"
              value={maintForm.description}
              onChange={(e) => setMaintForm({ ...maintForm, description: e.target.value })}
              placeholder="Describe maintenance scope..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setMaintModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={schedulingMaint}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 text-xs font-bold shadow-md disabled:opacity-50"
            >
              {schedulingMaint ? "Saving..." : "Schedule Service"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Photo Options Modal */}
      <Modal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        title="Manage Machinery Photos & Gallery"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5">
          {/* 1. File Upload Dropzone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              1. Upload Photos from Device
            </label>
            <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-50/60 dark:bg-slate-800/40 hover:bg-amber-500/5 group">
              <UploadCloud className="w-8 h-8 text-amber-500 group-hover:scale-110 transition-transform mb-1.5" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {uploadingFile ? "Compressing & Uploading Photos..." : "Click or Drag & Drop to Upload Photos"}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                PNG, JPG, JPEG, WebP • Multiple files supported
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploadingFile}
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* 2. Category Preset Photos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                2. Quick Category Preset Photos
              </label>
              <button
                type="button"
                onClick={() => {
                  const presets = CATEGORY_GALLERY_PRESETS[equipment.category] || CATEGORY_GALLERY_PRESETS["Dump Truck"];
                  setModalPhotos(presets);
                }}
                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Load All {equipment.category} Presets ({CATEGORY_GALLERY_PRESETS[equipment.category]?.length || 4} Photos)
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {(CATEGORY_GALLERY_PRESETS[equipment.category] || CATEGORY_GALLERY_PRESETS["Dump Truck"]).map((presetUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (!modalPhotos.includes(presetUrl)) {
                      setModalPhotos((prev) => [...prev, presetUrl]);
                    }
                  }}
                  className="group relative h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-all text-left"
                >
                  <img src={presetUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-white">
                    + Add View
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Custom Image URL Input & Google Search Assistant */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                3. Or Add from Google / Web URL
              </label>
              <button
                type="button"
                onClick={() => setGoogleModalOpen(true)}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                Find on Google Images / Web Library
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="Paste image link, google.com/imgres?..., etc."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
              <button
                type="button"
                onClick={handleAddCustomUrl}
                disabled={!customUrlInput.trim()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs disabled:opacity-40 cursor-pointer"
              >
                + Add
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Google redirect links and web URLs are automatically cleaned and converted into direct photos.
            </p>
          </div>

          {/* 4. Active Gallery Preview & Management */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Selected Machinery Photos ({modalPhotos.length})
              </label>
              <span className="text-[10px] text-slate-400">
                First photo is used as Primary Cover
              </span>
            </div>

            {modalPhotos.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                No photos added yet. Upload files above or choose from category presets.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1">
                {modalPhotos.map((photoUrl, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-20 bg-slate-100 dark:bg-slate-800"
                  >
                    <img
                      src={photoUrl}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_MACHINERY_IMAGE;
                      }}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Primary Badge */}
                    {idx === 0 ? (
                      <span className="absolute top-1 left-1 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
                        <Star className="w-2.5 h-2.5 fill-current" /> Cover
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryPhoto(idx)}
                        className="absolute top-1 left-1 bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-[9px] font-bold px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Set as Cover Photo"
                      >
                        Set Cover
                      </button>
                    )}

                    {/* Delete Photo Button */}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
                      title="Remove photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setPhotoModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={updatingPhoto || modalPhotos.length === 0}
              onClick={handleSaveGallery}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md disabled:opacity-50 cursor-pointer"
            >
              {updatingPhoto ? "Saving Gallery..." : `Save Gallery (${modalPhotos.length} Photos)`}
            </button>
          </div>
        </div>
      </Modal>

      {/* Google Image Picker Modal */}
      <GoogleImagePickerModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        onSelectImage={(url) => setModalPhotos((prev) => [...prev, url])}
        equipmentName={equipment.name}
        category={equipment.category}
        manufacturer={equipment.manufacturer}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Machinery Deletion"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to delete{" "}
            <strong>{equipment.name} ({equipment.equipmentCode})</strong>?
          </p>
          <div className="flex justify-end gap-3 pt-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Confirm Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EquipmentDetails;
