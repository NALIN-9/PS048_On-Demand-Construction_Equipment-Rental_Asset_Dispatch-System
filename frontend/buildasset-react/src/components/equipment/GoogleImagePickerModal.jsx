import React, { useState } from "react";
import Modal from "../ui/Modal";
import {
  CATEGORY_GALLERY_PRESETS,
  sanitizeImageUrl,
  getGoogleImageSearchUrl,
} from "../../utils/equipmentImages";
import {
  Search,
  ExternalLink,
  Check,
  Plus,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  Copy,
} from "lucide-react";

const GoogleImagePickerModal = ({
  isOpen,
  onClose,
  onSelectImage,
  equipmentName = "",
  category = "Excavator",
  manufacturer = "",
}) => {
  const [activeTab, setActiveTab] = useState("google"); // 'google' or 'gallery'
  const [pastedUrl, setPastedUrl] = useState("");
  const [cleanUrl, setCleanUrl] = useState("");
  const [previewError, setPreviewError] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(category || "Excavator");

  const googleSearchUrl = getGoogleImageSearchUrl(equipmentName, selectedCategory, manufacturer);

  const handleUrlChange = (e) => {
    const raw = e.target.value;
    setPastedUrl(raw);
    const cleaned = sanitizeImageUrl(raw);
    setCleanUrl(cleaned);
    setPreviewError(false);
  };

  const handleAddCleanedUrl = () => {
    if (!cleanUrl) return;
    onSelectImage(cleanUrl);
    setPastedUrl("");
    setCleanUrl("");
    onClose();
  };

  const handleSelectPreset = (url) => {
    onSelectImage(url);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Machinery Photo from Google & Web"
      size="xl"
    >
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("google")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "google"
                ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Search className="w-4 h-4 text-blue-500" />
            Google Images Search & Link Extractor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("gallery")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "gallery"
                ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Instant Curated Web Photo Library
          </button>
        </div>

        {activeTab === "google" ? (
          <div className="space-y-4">
            {/* Step 1: Open Google Images in new tab */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-amber-500/5 to-transparent border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                  <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">1</span>
                  Search Heavy Machinery on Google Images
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  Click the button to open Google Images with pre-filled search terms for <strong>{manufacturer} {equipmentName || selectedCategory}</strong>.
                </p>
              </div>

              <a
                href={googleSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                Open Google Images
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
            </div>

            {/* How to copy tip */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">2</span>
                How to copy image from Google:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] pl-1">
                <li>On Google Images, right click on the photo and select <strong>"Copy image address"</strong> (or copy the webpage link).</li>
                <li>Paste it into the box below. Google search redirect links will be <strong>automatically cleaned and extracted</strong> into direct image links!</li>
              </ul>
            </div>

            {/* Step 2: Paste link */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">3</span>
                Paste Google Image Link / Web Image URL:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pastedUrl}
                  onChange={handleUrlChange}
                  placeholder="Paste Google image link, https://images.unsplash.com/..., etc."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-amber-500/50"
                />
                {cleanUrl && (
                  <button
                    type="button"
                    onClick={handleAddCleanedUrl}
                    disabled={previewError}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Photo
                  </button>
                )}
              </div>
            </div>

            {/* Cleaned URL indicator and live preview */}
            {cleanUrl && (
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Extracted Direct Image URL:
                  </span>
                  <span className="font-mono text-slate-400 text-[10px] truncate max-w-xs">
                    {cleanUrl}
                  </span>
                </div>

                <div className="relative w-full h-52 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                  {!previewError ? (
                    <img
                      src={cleanUrl}
                      alt="Google Extracted Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                      onError={() => setPreviewError(true)}
                    />
                  ) : (
                    <div className="p-4 text-center text-rose-400 text-xs space-y-1">
                      <AlertCircle className="w-6 h-6 mx-auto mb-1" />
                      <div className="font-bold">Image failed to preview directly</div>
                      <div className="text-[10px] text-slate-400 max-w-sm mx-auto">
                        Some websites block external hotlinking. Try opening the image in a new tab, right click & save to device, then use "Upload from Computer".
                      </div>
                    </div>
                  )}
                </div>

                {!previewError && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddCleanedUrl}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      Looks Great, Add to Gallery
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Tab 2: Curated Web Machinery Library */
          <div className="space-y-4">
            {/* Category Selector Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {Object.keys(CATEGORY_GALLERY_PRESETS).map((catName) => (
                <button
                  key={catName}
                  type="button"
                  onClick={() => setSelectedCategory(catName)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedCategory === catName
                      ? "bg-amber-500 text-slate-950 shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  {catName}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(CATEGORY_GALLERY_PRESETS[selectedCategory] || []).map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectPreset(url)}
                  className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video cursor-pointer hover:border-amber-500 hover:shadow-lg transition-all"
                >
                  <img
                    src={url}
                    alt={`${selectedCategory} angle ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow">
                      <Plus className="w-3.5 h-3.5" />
                      Select Photo
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default GoogleImagePickerModal;
