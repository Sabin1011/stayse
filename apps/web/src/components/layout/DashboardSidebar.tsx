
import { NavLink } from "react-router-dom";
import { X, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

export interface DashboardNavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface DashboardSidebarProps {
  title: string;
  subtitle: string;
  items: DashboardNavItem[];
  isOpen: boolean;
  onClose: () => void;
}

export default function DashboardSidebar({
  title,
  subtitle,
  items,
  isOpen,
  onClose,
}: DashboardSidebarProps) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col
          border-r border-slate-800/80 bg-[#111B2D] text-white
          transition-transform duration-300 ease-out
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand */}
        <div className="flex h-[88px] items-center justify-between border-b border-white/[0.07] px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500 text-lg font-black text-white shadow-lg shadow-blue-500/20">
              s.
            </div>
            <div>
              <h2 className="text-[22px] font-extrabold tracking-[-1px] text-white">
                stayse<span className="text-blue-400">.</span>
              </h2>
              <p className="mt-0.5 text-[11px] font-medium tracking-wide text-slate-400">
                {subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Workspace label */}
        <div className="px-5 pt-8">
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
            {title}
          </p>

          <nav className="space-y-1.5">
            {items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/host/dashboard" || item.path === "/admin/dashboard"}
                onClick={onClose}
                className={({ isActive }) =>
                  `
                    group relative flex items-center gap-3.5
                    rounded-xl px-3.5 py-3.5 text-[13px] font-semibold
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-950/30"
                        : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                    }
                  `
                }
              >
                <span className="flex h-5 w-5 items-center justify-center">
                  {item.icon}
                </span>
                <span>{item.label}</span>
                <ArrowUpRight
                  size={14}
                  className="ml-auto opacity-0 transition group-hover:opacity-50"
                />
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom workspace card */}
        <div className="mt-auto p-5">
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.045] p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
              <span className="text-[11px] font-semibold text-slate-300">
                Workspace active
              </span>
            </div>
            <p className="text-xs leading-5 text-slate-400">
              Manage your Stayse workspace from one place.
            </p>
          </div>

          <p className="mt-5 text-center text-[10px] font-medium tracking-wide text-slate-600">
            STAYSE · ACCOMMODATION PLATFORM
          </p>
        </div>
      </aside>
    </>
  );
}
