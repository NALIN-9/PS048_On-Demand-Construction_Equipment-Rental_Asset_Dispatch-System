import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === "dashboard")) {
    return null;
  }

  const formatBreadcrumb = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, " ");
  };

  return (
    <nav className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-1" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            to="/dashboard"
            className="flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </li>

        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;

          return (
            <li key={to} className="flex items-center space-x-2">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
              {isLast ? (
                <span className="text-slate-900 dark:text-slate-100 font-bold" aria-current="page">
                  {formatBreadcrumb(value)}
                </span>
              ) : (
                <Link
                  to={to}
                  className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  {formatBreadcrumb(value)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
