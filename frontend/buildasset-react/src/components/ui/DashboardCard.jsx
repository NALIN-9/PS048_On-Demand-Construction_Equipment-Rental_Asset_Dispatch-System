import React from "react";
import { Link } from "react-router-dom";

const DashboardCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "amber",
  link,
}) => {
  const colorMap = {
    amber: {
      bg: "bg-amber-500/10 dark:bg-amber-500/15",
      border: "border-amber-500/20 dark:border-amber-500/30",
      text: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      backlight: "group-hover:bg-amber-500/10",
    },
    emerald: {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
      border: "border-emerald-500/20 dark:border-emerald-500/30",
      text: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      backlight: "group-hover:bg-emerald-500/10",
    },
    blue: {
      bg: "bg-blue-500/10 dark:bg-blue-500/15",
      border: "border-blue-500/20 dark:border-blue-500/30",
      text: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
      backlight: "group-hover:bg-blue-500/10",
    },
    cyan: {
      bg: "bg-cyan-500/10 dark:bg-cyan-500/15",
      border: "border-cyan-500/20 dark:border-cyan-500/30",
      text: "text-cyan-600 dark:text-cyan-400",
      iconBg: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
      backlight: "group-hover:bg-cyan-500/10",
    },
    indigo: {
      bg: "bg-indigo-500/10 dark:bg-indigo-500/15",
      border: "border-indigo-500/20 dark:border-indigo-500/30",
      text: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
      backlight: "group-hover:bg-indigo-500/10",
    },
    purple: {
      bg: "bg-purple-500/10 dark:bg-purple-500/15",
      border: "border-purple-500/20 dark:border-purple-500/30",
      text: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
      backlight: "group-hover:bg-purple-500/10",
    },
    rose: {
      bg: "bg-rose-500/10 dark:bg-rose-500/15",
      border: "border-rose-500/20 dark:border-rose-500/30",
      text: "text-rose-600 dark:text-rose-400",
      iconBg: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
      backlight: "group-hover:bg-rose-500/10",
    },
    slate: {
      bg: "bg-slate-100 dark:bg-slate-800/60",
      border: "border-slate-200 dark:border-slate-700/60",
      text: "text-slate-700 dark:text-slate-300",
      iconBg: "bg-slate-200/80 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300",
      backlight: "group-hover:bg-slate-500/5",
    },
  };

  const scheme = colorMap[color] || colorMap.amber;

  const content = (
    <div
      className={`p-5 sm:p-6 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.01] ${scheme.border} relative overflow-hidden group lightable lightable-${color} lightable-border cursor-pointer`}
    >
      {/* Soft Hover Backlight Glow */}
      <div
        className={`absolute -inset-1 rounded-2xl ${scheme.backlight} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
      />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className={`text-2xl sm:text-3xl font-black mt-2 tracking-tight ${scheme.text}`}>
            {value ?? 0}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div
            className={`p-3 rounded-xl ${scheme.iconBg} transition-transform duration-300 group-hover:scale-110 shadow-sm`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );

  return link ? (
    <Link to={link} className="block group">
      {content}
    </Link>
  ) : (
    content
  );
};

export default DashboardCard;
