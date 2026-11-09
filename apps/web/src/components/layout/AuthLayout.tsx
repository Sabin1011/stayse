import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, MapPin, ShieldCheck, Star } from "lucide-react";
import { useTheme } from "../../app/providers/ThemeProvider";

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1600&q=85";

export default function AuthLayout({ children, title, description }: AuthLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const isRegister = pathname === "/register";

  return (
    <main className="min-h-screen bg-background text-text lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <aside className="relative hidden min-h-screen overflow-hidden bg-slate-900 lg:flex lg:flex-col lg:justify-between">
        <img
          src={HERO_IMAGE}
          alt="Elegant accommodation interior with warm lighting"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/55 via-slate-900/10 to-slate-950/85" />
        <div className="relative z-10 p-12 xl:p-16">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md"><MapPin size={23} /></span>
            stayse<span className="text-blue-300">.</span>
          </Link>
        </div>
        <div className="relative z-10 max-w-xl px-12 pb-14 xl:px-16 xl:pb-20">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-medium text-white backdrop-blur-md">
            <Star size={14} fill="currentColor" /> Your next destination starts here
          </span>
          <h2 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
            {isRegister ? "Your next chapter begins somewhere beautiful." : "Find a place that feels like yours."}
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-200">
            Discover unique stays, memorable escapes, and spaces made for every kind of journey.
          </p>
          <div className="mt-9 flex items-center gap-2 text-sm text-white/85"><ShieldCheck size={18} /> Simple, secure, seamless stays</div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-5 py-6 sm:px-10 lg:justify-end lg:px-14">
          <Link to="/" className="text-2xl font-bold tracking-tight text-primary lg:hidden">stayse.</Link>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
          </button>
        </header>
        <section className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-[440px]">
            {(title || description) && (
              <div className="mb-8">
                {title && <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">{title}</h1>}
                {description && <p className="mt-3 text-sm leading-6 text-text-secondary sm:text-base">{description}</p>}
              </div>
            )}
            {children}
          </div>
        </section>
        <footer className="px-5 pb-7 text-center text-xs text-text-secondary sm:px-10">\u00a9 {new Date().getFullYear()} Stayse. Made for better journeys.</footer>
      </div>
    </main>
  );
}
