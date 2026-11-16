
import {
  Menu,
  Moon,
  Sun,
  LogOut,
  House,
  ChevronDown,
  Sparkles,
} from "lucide-react";

import { useTheme } from "../../app/providers/ThemeProvider";

interface DashboardHeaderProps {
  title: string;
  userName: string;
  userEmail?: string;
  onMenuClick: () => void;
  onLogout: () => void;
  modeSwitchLabel?: string;
  onModeSwitch?: () => void;
}

export default function DashboardHeader({
  title,
  userName,
  userEmail,
  onMenuClick,
  onLogout,
  modeSwitchLabel,
  onModeSwitch,
}: DashboardHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  const initials = userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-surface/90 backdrop-blur-xl">
      <div className="flex h-[76px] items-center justify-between gap-3 px-4 sm:px-7 lg:px-9">
        {/* Left section */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={onMenuClick}
            className="rounded-xl p-2.5 text-text-secondary transition hover:bg-surface-secondary hover:text-text lg:hidden"
          >
            <Menu size={21} />
          </button>

          <div className="min-w-0">
            <div className="mb-0.5 hidden items-center gap-1.5 sm:flex">
              <Sparkles size={12} className="text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-secondary">
                Stayse workspace
              </span>
            </div>
            <h1 className="truncate text-lg font-bold tracking-[-0.035em] text-text sm:text-xl">
              {title}
            </h1>
          </div>
        </div>

        {/* Right section */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {modeSwitchLabel && onModeSwitch && (
            <button
              type="button"
              onClick={onModeSwitch}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-text-secondary transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary sm:px-4 sm:text-sm"
            >
              <House size={16} />
              <span>{modeSwitchLabel}</span>
            </button>
          )}

          <button
            type="button"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          >
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
          </button>

          <div className="mx-1 hidden h-8 w-px bg-border sm:block" />

          {/* User information */}
          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
              {initials || "U"}
            </div>

            <div className="max-w-36">
              <p className="truncate text-xs font-bold text-text">
                {userName}
              </p>
              {userEmail && (
                <p className="mt-0.5 truncate text-[11px] text-text-secondary">
                  {userEmail}
                </p>
              )}
            </div>
            <ChevronDown size={15} className="text-text-secondary" />
          </div>

          <button
            type="button"
            aria-label="Log out"
            title="Log out"
            onClick={onLogout}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary transition hover:border-error/30 hover:bg-error/5 hover:text-error"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
