import type { ReactNode } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../app/providers/ThemeProvider";
import Button from "../ui/Button";

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

function AuthLayout({
  children,
  title,
  description,
}: AuthLayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-text transition-colors duration-200">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <span className="text-2xl font-bold tracking-tight text-primary">
          stayse.
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? (
            <Moon size={18} />
          ) : (
            <Sun size={18} />
          )}
          <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
        </Button>
      </header>

      {/* Authentication content */}
      <section className="flex min-h-[calc(100vh-120px)] items-center justify-center py-10">
        <div className="w-full max-w-md">
          {(title || description) && (
            <div className="mb-6 text-center">
              {title && (
                <h1 className="text-3xl font-bold tracking-tight">
                  {title}
                </h1>
              )}

              {description && (
                <p className="mt-2 text-sm text-text-secondary">
                  {description}
                </p>
              )}
            </div>
          )}

          {children}
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;