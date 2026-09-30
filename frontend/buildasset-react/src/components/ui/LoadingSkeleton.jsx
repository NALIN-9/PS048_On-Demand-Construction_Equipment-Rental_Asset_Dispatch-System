import React from "react";

export const CardSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm animate-pulse"
        >
          <div className="h-48 bg-slate-200 dark:bg-slate-800" />
          <div className="p-5 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>
            <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const TableRowSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 animate-pulse">
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-6 py-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full max-w-[120px]" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};

export const StatCardSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm animate-pulse flex items-center justify-between"
        >
          <div className="space-y-2">
            <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
};
