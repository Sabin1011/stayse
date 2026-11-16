
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Menu,
  UserRound,
  X,
  Moon,
  Sun,
  BriefcaseBusiness,
} from "lucide-react";

import { useAppSelector } from "../../../app/store/hooks";
import { useLogout } from "../../auth/hooks/useLogout";
import { useTheme } from "../../../app/providers/ThemeProvider";

export default function SiteNavbar() {
  const user = useAppSelector((state) => state.auth.user);
  const logout = useLogout();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const isHost = user?.roles?.includes("host") ?? false;

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const switchToHosting = () => {
    setMenuOpen(false);
    navigate("/host/dashboard");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          to="/"
          className="text-[27px] font-extrabold tracking-[-1.5px] text-primary"
        >
          stayse<span className="text-accent">.</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-text-secondary md:flex">
          <a href="#stays" className="transition hover:text-primary">
            Explore stays
          </a>
          <a href="#destinations" className="transition hover:text-primary">
            Destinations
          </a>
          <a href="#why-stayse" className="transition hover:text-primary">
            Why Stayse
          </a>
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition hover:bg-surface-secondary"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-text-secondary transition hover:bg-surface-secondary hover:text-primary"
          >
            <Heart size={17} />
            Saved
          </button>

          <div className="group relative">
            <button
              type="button"
              aria-label="Open account menu"
              className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 shadow-sm transition hover:shadow-md"
            >
              <Menu size={17} className="text-text-secondary" />
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                <UserRound size={17} />
              </span>
            </button>

            <div className="invisible absolute right-0 top-full mt-2 w-56 translate-y-1 rounded-2xl border border-border bg-surface p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <p className="truncate px-3 py-2 text-xs text-text-secondary">
                {user?.fullName || user?.email || "Your account"}
              </p>

              <Link
                to="/account/profile"
                className="block rounded-xl px-3 py-2.5 text-sm hover:bg-surface-secondary"
              >
                My Profile
              </Link>

              <Link
                to="/account/change-password"
                className="block rounded-xl px-3 py-2.5 text-sm hover:bg-surface-secondary"
              >
                Change password
              </Link>

              {isHost && (
                <button
                  type="button"
                  onClick={switchToHosting}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-primary hover:bg-primary/10"
                >
                  <BriefcaseBusiness size={17} />
                  Switch to Hosting
                </button>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Log out
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
          className="rounded-xl border border-border p-2.5 text-text md:hidden"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-border bg-surface px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-1 text-sm font-semibold">
            <a
              onClick={() => setMenuOpen(false)}
              href="#stays"
              className="rounded-xl px-3 py-3 hover:bg-surface-secondary"
            >
              Explore stays
            </a>

            <a
              onClick={() => setMenuOpen(false)}
              href="#destinations"
              className="rounded-xl px-3 py-3 hover:bg-surface-secondary"
            >
              Destinations
            </a>

            <Link
              to="/account/profile"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-3 py-3 hover:bg-surface-secondary"
            >
              My Profile
            </Link>

            <Link
              to="/account/change-password"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-3 py-3 hover:bg-surface-secondary"
            >
              Change password
            </Link>

            {isHost && (
              <button
                type="button"
                onClick={switchToHosting}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-left font-semibold text-primary hover:bg-primary/10"
              >
                <BriefcaseBusiness size={18} />
                Switch to Hosting
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl px-3 py-3 text-left text-red-600 hover:bg-red-50"
            >
              Log out
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-surface-secondary"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
              {theme === "light" ? "Dark mode" : "Light mode"}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
