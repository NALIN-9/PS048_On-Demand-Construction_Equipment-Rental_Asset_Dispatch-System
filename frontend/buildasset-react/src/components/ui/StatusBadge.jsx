import React from "react";

const StatusBadge = ({ status, size = "md" }) => {
  const normalized = status ? status.toUpperCase().trim() : "UNKNOWN";

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] font-semibold",
    md: "px-2.5 py-1 text-xs font-semibold",
    lg: "px-3 py-1.5 text-sm font-semibold",
  };

  const getBadgeStyle = (st) => {
    switch (st) {
      // Equipment & Dispatch Active Positive States
      case "AVAILABLE":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 ring-emerald-500/20";
      case "COMPLETED":
      case "ACTIVE":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 ring-emerald-500/20";

      // In-Progress / Operating States
      case "IN_USE":
        return "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30 ring-cyan-500/20";
      case "IN_TRANSIT":
      case "IN_PROGRESS":
        return "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30 ring-sky-500/20";
      case "ARRIVED":
        return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30 ring-indigo-500/20";

      // Scheduled / Planned States
      case "RESERVED":
      case "PLANNED":
      case "SCHEDULED":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 ring-amber-500/20";
      case "DISPATCHED":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 ring-blue-500/20";

      // Maintenance / Warning States
      case "MAINTENANCE":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30 ring-orange-500/20";

      // Inactive / Completed / Neutral States
      case "RETURNED":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30 ring-purple-500/20";
      case "CANCELLED":
      case "DELETED":
        return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 ring-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30 ring-slate-500/20";
    }
  };

  const formatLabel = (st) => {
    return st.replace(/_/g, " ");
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ring-1 ring-inset font-medium tracking-wide uppercase ${getBadgeStyle(
        normalized
      )} ${sizeClasses[size] || sizeClasses.md}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {formatLabel(normalized)}
    </span>
  );
};

export default StatusBadge;
