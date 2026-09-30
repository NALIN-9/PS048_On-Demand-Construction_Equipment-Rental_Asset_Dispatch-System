import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import Notification from "../../components/ui/Notification";
import GoogleImagePickerModal from "../../components/equipment/GoogleImagePickerModal";
import {
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
  Plus,
  Image as ImageIcon,
  IndianRupee,
  UploadCloud,
  X,
  Star,
  Layers,
  Check,
  Search,
  Globe,
} from "lucide-react";

const AddEquipment = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [googleModalOpen, setGoogleModalOpen] = useState(false);

  const [photos, setPhotos] = useState([]);

  const [formData, setFormData] = useState({
    equipmentCode: "",
    name: "",
    category: "Excavator",
    manufacturer: "",
    model: "",
    yearOfManufacture: new Date().getFullYear(),
    dailyRate: "",
    location: "",
    description: "",
  });

  const categories = [
    "Excavator",
    "Bulldozer",
    "Crane",
    "Dump Truck",
    "Backhoe Loader",
    "Compactor",
    "Motor Grader",
    "Wheel Loader",
    "Forklift",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      setUploadingFile(true);
      const compressedList = await Promise.all(
        files.map((f) => compressImageFile(f, 1200, 0.82))
      );
      setPhotos((prev) => [...prev, ...compressedList]);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
      setPhotos((prev) => [...prev, cleaned]);
      setCustomUrlInput("");
    }
  };

  const handleApplyPresetGallery = (catName) => {
    const presetGallery =
      CATEGORY_GALLERY_PRESETS[catName] || CATEGORY_GALLERY_PRESETS["Excavator"];
    setPhotos((prev) => Array.from(new Set([...prev, ...presetGallery])));
  };

  const handleApplySinglePreset = (catName) => {
    const single =
      CATEGORY_IMAGE_PRESETS[catName] || CATEGORY_IMAGE_PRESETS["Excavator"];
    setPhotos((prev) => [single, ...prev.filter((p) => p !== single)]);
  };

  const handleRemovePhoto = (idx) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSetCoverPhoto = (idx) => {
    setPhotos((prev) => {
      const selected = prev[idx];
      const rest = prev.filter((_, i) => i !== idx);
      return [selected, ...rest];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Determine final image URL value:
      let finalImageUrl = "";
      if (photos.length === 1) {
        finalImageUrl = photos[0];
      } else if (photos.length > 1) {
        finalImageUrl = JSON.stringify(photos);
      } else {
        // Fallback default for category
        finalImageUrl =
          CATEGORY_IMAGE_PRESETS[formData.category] ||
          CATEGORY_IMAGE_PRESETS["Excavator"];
      }

      const payload = {
        ...formData,
        equipmentCode: formData.equipmentCode.trim().toUpperCase(),
        yearOfManufacture: parseInt(formData.yearOfManufacture, 10),
        dailyRate: parseFloat(formData.dailyRate),
        imageUrl: finalImageUrl,
      };

      const response = await axiosClient.post("/api/equipment", payload);
      setNotification({
        type: "success",
        message: "Equipment asset registered successfully with photos!",
      });
      setTimeout(() => {
        navigate(`/equipment/${response.data.id}`);
      }, 1000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to register equipment. Check for duplicate equipment code.";
      setNotification({ type: "error", message: msg });
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

      {/* Google & Web Image Search Modal */}
      <GoogleImagePickerModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        onSelectImage={(url) => setPhotos((prev) => [...prev, url])}
        equipmentName={formData.name}
        category={formData.category}
        manufacturer={formData.manufacturer}
      />

      <div className="flex items-center justify-between">
        <Link
          to="/equipment"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Equipment List
        </Link>
      </div>

      <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6 lightable lightable-border">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
            <Tractor className="w-4 h-4" />
            New Fleet Asset
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Register Machinery
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Add heavy equipment asset to BuildAsset platform inventory with multiple high-definition photos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Equipment Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="equipmentCode"
                required
                value={formData.equipmentCode}
                onChange={handleChange}
                placeholder="e.g. CAT-320D, JCB-3DX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono uppercase text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Equipment Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Hydraulic Excavator 20T"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                placeholder="e.g. Caterpillar, Komatsu, JCB"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Model
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g. 320 GC, PC200"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Year of Manufacture
              </label>
              <input
                type="number"
                name="yearOfManufacture"
                min="1990"
                max={new Date().getFullYear() + 1}
                value={formData.yearOfManufacture}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Daily Rental Rate (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="dailyRate"
                required
                min="1"
                step="0.01"
                value={formData.dailyRate}
                onChange={handleChange}
                placeholder="e.g. 12500.00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-amber-600 dark:text-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Base Yard Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. North Yard, Bay 4"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* MACHINERY PHOTOS & MULTI-IMAGE UPLOAD SECTION */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-500" />
                  Machinery Photos & Gallery ({photos.length})
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Upload multiple photos from your device, find directly on Google Images, or paste any web link.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setGoogleModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  Find on Google Images / Web
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyPresetGallery(formData.category)}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Load {formData.category} Angle Preset ({CATEGORY_GALLERY_PRESETS[formData.category]?.length || 3})
                </button>
              </div>
            </div>

            {/* Upload Zone & URL Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* File Upload Trigger */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 rounded-2xl p-4 text-center cursor-pointer bg-white/70 dark:bg-slate-800/60 hover:bg-amber-500/5 transition-all flex flex-col items-center justify-center gap-1.5 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {uploadingFile ? "Optimizing & processing images..." : "Upload from Computer / Device"}
                </div>
                <div className="text-[10px] text-slate-400">
                  Supports multiple PNG, JPG, WebP (auto-compressed)
                </div>
              </div>

              {/* URL Input Form with Auto-Extractor */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60 flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    Paste Google / Web Image URL
                  </label>
                  <button
                    type="button"
                    onClick={() => setGoogleModalOpen(true)}
                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                  >
                    <Search className="w-3 h-3" /> Search Google
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="Paste image link, google.com/imgres?..., or https://..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-amber-500/50"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomUrl}
                    className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs hover:bg-amber-500 hover:text-slate-950 transition-all shrink-0 cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>
                <div className="text-[10px] text-slate-400">
                  Google search links are automatically cleaned and converted into direct photos
                </div>
              </div>
            </div>

            {/* Category Quick Presets Row */}
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Quick Category Presets:
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {Object.entries(CATEGORY_IMAGE_PRESETS).map(([catName, presetUrl]) => (
                  <button
                    key={catName}
                    type="button"
                    onClick={() => handleApplySinglePreset(catName)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-400 transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer"
                  >
                    <img src={presetUrl} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                    + {catName}
                  </button>
                ))}
              </div>
            </div>

            {/* Uploaded Photos Gallery Manager */}
            {photos.length > 0 ? (
              <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Photo Gallery Manager ({photos.length})</span>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                    First photo is the Cover Image
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {photos.map((url, idx) => (
                    <div
                      key={idx}
                      className={`group relative rounded-xl overflow-hidden border-2 transition-all aspect-video bg-slate-900 ${
                        idx === 0
                          ? "border-amber-500 shadow-md ring-2 ring-amber-500/30"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-400"
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Machinery Photo ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getCategorySvgPlaceholder(formData.category, formData.name || formData.equipmentCode);
                        }}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <div className="absolute top-1 left-1 bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-current" /> Cover
                        </div>
                      )}

                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetCoverPhoto(idx)}
                            className="px-2 py-1 rounded bg-amber-500 text-slate-950 text-[10px] font-bold hover:bg-amber-400 shadow cursor-pointer"
                          >
                            Set Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="p-1 rounded-full bg-rose-500/80 hover:bg-rose-500 text-white transition-colors cursor-pointer"
                          title="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
                <Tractor className="w-4 h-4 shrink-0" />
                <span>No custom photos uploaded yet. The default high-res <strong>{formData.category}</strong> photo preset will be assigned automatically if left blank.</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Technical Description & Notes
            </label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Include operational capacity, attachments, engine horsepower..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/equipment"
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
              {loading ? "Registering..." : "Save Equipment Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEquipment;
