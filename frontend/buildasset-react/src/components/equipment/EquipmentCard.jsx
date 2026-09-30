import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../ui/StatusBadge";
import {
  getEquipmentImage,
  DEFAULT_MACHINERY_IMAGE,
  getCategorySvgPlaceholder,
} from "../../utils/equipmentImages";
import {
  Tractor,
  MapPin,
  Calendar,
  ArrowRight,
  Edit,
  Trash2,
} from "lucide-react";

const EquipmentCard = ({ equipment, onDelete }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ROLE_ADMIN";

  const {
    id,
    equipmentCode,
    name,
    category,
    manufacturer,
    model,
    yearOfManufacture,
    dailyRate,
    status,
    location,
    imageUrl,
  } = equipment;

  const fallbackSvg = getCategorySvgPlaceholder(category, name || equipmentCode);
  const displayImage = getEquipmentImage(imageUrl, category) || fallbackSvg;
  const [currentSrc, setCurrentSrc] = useState(displayImage);

  const formattedRate =
    dailyRate != null
      ? Number(dailyRate).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "0.00";

  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-300/50 dark:hover:shadow-amber-500/5 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 lightable lightable-border cursor-pointer">
      {/* Equipment Image Container with Zoom & Overlay */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800/80">
        <img
          src={currentSrc}
          alt={name || "Equipment"}
          referrerPolicy="no-referrer"
          onError={() => {
            if (currentSrc !== fallbackSvg) {
              setCurrentSrc(fallbackSvg);
            }
          }}
          className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Status Badge Overlay */}
        <div className="absolute top-3 left-3 z-10">
          <StatusBadge status={status} size="sm" />
        </div>

        {/* Equipment Code Pill */}
        <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-[11px] font-mono font-bold text-amber-400 border border-slate-700/50 shadow-sm">
          {equipmentCode || `EQ-${id}`}
        </div>

        {/* Hover Action Overlay */}
        <Link
          to={`/equipment/${id}`}
          className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
        >
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            View Equipment
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>

      {/* Equipment Details Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
              <Link to={`/equipment/${id}`}>{name}</Link>
            </h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">
            {[manufacturer, model].filter(Boolean).join(" • ") || category || "Heavy Machinery"}
          </p>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 gap-2 py-2.5 my-2 border-y border-slate-100 dark:border-slate-800/80 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{location || "—"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{yearOfManufacture || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Pricing & Bottom Action Bar */}
        <div className="pt-3 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Daily Rate
            </span>
            <div className="flex items-center text-amber-600 dark:text-amber-400 font-bold text-base">
              <span className="text-xs mr-0.5">₹</span>
              <span>{formattedRate}</span>
              <span className="text-[11px] text-slate-400 font-normal ml-1">/day</span>
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-1.5">
              <Link
                to={`/equipment/edit/${id}`}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Edit Specs"
              >
                <Edit className="w-4 h-4" />
              </Link>
              {onDelete && (
                <button
                  onClick={() => onDelete(id)}
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                  title="Delete Equipment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentCard;
